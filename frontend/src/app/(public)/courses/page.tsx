import { CourseListContainer } from "@/components/courses/CourseListContainer";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دوره‌های آموزشی برنامه‌نویسی و مهارت‌های تخصصی | تک‌یاد",
  description: "کاتالوگ جامع دوره‌های آنلاین برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهندسی نرم‌افزار با اساتید مطرح و گواهینامه معتبر در پلتفرم تک‌یاد.",
  keywords: [
    "دوره‌های برنامه‌نویسی",
    "آموزش پایتون",
    "آموزش ری‌اکت",
    "آموزش وب",
    "هوش مصنوعی",
    "دوره‌های تخصصی آنلاین",
    "تک‌یاد",
  ],
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tekyad.ir/courses",
    siteName: "تک‌یاد",
    title: "دوره‌های آموزشی برنامه‌نویسی و مهارت‌های تخصصی | تک‌یاد",
    description: "کاتالوگ جامع دوره‌های آنلاین برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهندسی نرم‌افزار با اساتید مطرح و گواهینامه معتبر در پلتفرم تک‌یاد.",
    images: [
      {
        url: "https://picsum.photos/seed/tekyad-courses/1200/630",
        width: 1200,
        height: 630,
        alt: "دوره‌های آموزشی تک‌یاد",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "دوره‌های آموزشی برنامه‌نویسی و مهارت‌های تخصصی | تک‌یاد",
    description: "کاتالوگ جامع دوره‌های آنلاین برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهندسی با اساتید مطرح.",
    images: ["https://picsum.photos/seed/tekyad-courses/1200/630"],
  },
};

export default function CoursesPage() {
  const catalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "دوره‌های آموزشی تک‌یاد",
    "description": "فهرست دوره‌های آموزشی تخصصی آنلاین در پلتفرم تک‌یاد",
    "url": "https://tekyad.ir/courses",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد",
      "url": "https://tekyad.ir"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-600">درحال بارگذاری دوره‌ها...</div>}>
        <CourseListContainer />
      </Suspense>
    </>
  );
}
