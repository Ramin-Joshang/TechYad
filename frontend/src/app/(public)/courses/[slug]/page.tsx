import { CourseDetailsContainer } from "@/components/courses/CourseDetailsContainer";
import { Suspense } from "react";
import type { Metadata } from "next";

async function fetchCourseData(identifier: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/courses/${encodeURIComponent(identifier)}`, {
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
  const course = await fetchCourseData(identifier);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/courses/${encodeURIComponent(identifier)}`;

  if (!course) {
    return {
      title: 'دوره آموزشی | تک‌یاد (Tecyad)',
      description: 'مشاهده سرفصل‌ها، ویدیوهای پیش‌نمایش و ثبت‌نام در دوره‌های تخصصی آموزشگاه آنلاین تک‌یاد (Tecyad).',
    };
  }

  const title = `${course.title} | دوره آموزش تخصصی تک‌یاد (Tecyad)`;
  const rawDescription = course.description || course.shortDescription || '';
  const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').slice(0, 155);
  const description = cleanDescription.length > 50 
    ? `${cleanDescription}...`
    : `ثبت‌نام در دوره آموزشی ${course.title} در تک‌یاد (Tecyad) با تدریس برترین اساتید و دریافت مدرک معتبر مهارت.`;

  const imageUrl = course.thumbnail || `${baseUrl}/images/course-default.jpg`;

  return {
    title,
    description,
    keywords: [
      course.title,
      course.category?.name || 'آموزش برنامه‌نویسی',
      'دوره آنلاین',
      'یادگیری مهارت',
      'تک‌یاد',
      'Tecyad',
      'آموزش تخصصی',
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
          alt: course.title,
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

export default async function CoursePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const course = await fetchCourseData(resolvedParams.slug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir';
  const pageUrl = `${baseUrl}/courses/${encodeURIComponent(resolvedParams.slug)}`;

  const courseJsonLd = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": (course.description || course.shortDescription || '').replace(/<[^>]*>/g, '').slice(0, 300),
    "url": pageUrl,
    "image": course.thumbnail || `${baseUrl}/images/course-default.jpg`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد | Tecyad",
      "sameAs": "https://tecyad.ir"
    },
    "instructor": course.instructor ? {
      "@type": "Person",
      "name": `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || 'استاد تک‌یاد',
      "image": course.instructor.avatar || undefined
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": course.price || 0,
      "priceCurrency": "IRR",
      "availability": "https://schema.org/InStock",
      "category": "Education"
    },
    "aggregateRating": course.ratingCount && course.ratingCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": course.averageRating || 5,
      "reviewCount": course.ratingCount,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  } : null;

  return (
    <>
      {courseJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-600">درحال بارگذاری دوره...</div>}>
        <CourseDetailsContainer slug={resolvedParams.slug} />
      </Suspense>
    </>
  );
}
