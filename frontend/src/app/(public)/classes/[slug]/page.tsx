import { ClassDetailsContainer } from '@/components/classes/ClassDetailsContainer';
import type { Metadata } from 'next';

async function fetchClassData(identifier: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/classes/${encodeURIComponent(identifier)}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug?: string, id?: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id || '';
  const classItem = await fetchClassData(identifier);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/classes/${encodeURIComponent(identifier)}`;

  if (!classItem) {
    return {
      title: 'کلاس آنلاین و وبینار تخصصی | تک‌یاد (Tecyad)',
      description: 'شرکت در کلاس‌های تعاملی آنلاین، کارگاه‌های زنده و دوره‌های مهارتی با حضور اساتید برتر در تک‌یاد (Tecyad).',
    };
  }

  const title = `${classItem.title} | کلاس تعاملی آنلاین تک‌یاد (Tecyad)`;
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
  const classItem = await fetchClassData(resolvedParams.slug);

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
      <ClassDetailsContainer slug={resolvedParams.slug} />
    </>
  );
}
