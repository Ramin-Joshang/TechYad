import { ClassDetailsContainer } from '@/components/classes/ClassDetailsContainer';
import { fetchClass } from '@/lib/server-api';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug?: string, id?: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id || '';
  const classItem = await fetchClass(identifier);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/classes/${encodeURIComponent(identifier)}`;

  if (!classItem) {
    return {
      title: 'کلاس آنلاین و وبینار تخصصی | تک‌یاد',
      description: 'شرکت در کلاس‌های تعاملی آنلاین، کارگاه‌های زنده و دوره‌های مهارتی با حضور اساتید برتر در تک‌یاد.',
    };
  }

  const title = `${classItem.title} | تک‌یاد`;
  const rawDesc = classItem.description || '';
  const cleanDesc = rawDesc.replace(/<[^>]*>/g, '').slice(0, 155);
  const description = cleanDesc.length > 50
    ? `${cleanDesc}...`
    : `ثبت‌نام در کلاس زنده و وبینار تخصصی ${classItem.title} با پشتیبانی و ظرفیت محدود در تک‌یاد (Tecyad).`;

  const imageUrl = classItem.thumbnail || `${baseUrl}/images/class-default.jpg`;

  return {
    title,
    description,
    keywords: [
      classItem.title,
      'کلاس آنلاین',
      'وبینار آموزشی',
      'کارگاه زنده',
      'تک‌یاد',
      'Tecyad',
      'آموزش تعاملی',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      url: pageUrl,
      title,
      description,
      siteName: 'تک‌یاد | Tecyad',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: classItem.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ClassDetailsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const classItem = await fetchClass(resolvedParams.slug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/classes/${encodeURIComponent(resolvedParams.slug)}`;

  const classJsonLd = classItem ? {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    "name": classItem.title,
    "description": (classItem.description || '').replace(/<[^>]*>/g, '').slice(0, 300),
    "url": pageUrl,
    "image": classItem.thumbnail || `${baseUrl}/images/class-default.jpg`,
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "startDate": classItem.startDate || classItem.createdAt,
    "endDate": classItem.endDate || undefined,
    "organizer": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد | Tecyad",
      "url": "https://tecyad.ir"
    },
    "performer": classItem.instructor ? {
      "@type": "Person",
      "name": `${classItem.instructor.firstName || ''} ${classItem.instructor.lastName || ''}`.trim() || 'مدرس تک‌یاد'
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": classItem.price || 0,
      "priceCurrency": "IRR",
      "availability": classItem.enrolledCount >= classItem.capacity ? "https://schema.org/SoldOut" : "https://schema.org/InStock"
    }
  } : null;

  return (
    <>
      {classJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(classJsonLd) }}
        />
      )}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'کلاس‌های زنده و آنلاین', href: '/classes' },
              ...(classItem?.category?.name ? [{ label: classItem.category.name, href: `/classes?category=${classItem.category._id || classItem.category.slug}` }] : []),
              { label: classItem?.title || resolvedParams.slug },
            ]}
          />
        </div>
      </div>
      <ClassDetailsContainer slug={resolvedParams.slug} initialData={classItem} />
    </>
  );
}
