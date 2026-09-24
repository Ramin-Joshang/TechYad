import { ClassesList } from '@/components/classes/ClassesList';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "کلاس‌های آنلاین، کارگاه‌های زنده و وبینارهای تخصصی | تک‌یاد",
  description: "شرکت در کلاس‌های تعاملی آنلاین، کارگاه‌های پروژه‌محور و جلسات رفع اشکال با ظرفیت محدود و اساتید مجرب در آکادمی تک‌یاد.",
  keywords: [
    "کلاس آنلاین",
    "وبینار تخصصی",
    "کارگاه آنلاین",
    "کلاس زنده برنامه‌نویسی",
    "تک‌یاد",
    "آموزش تعاملی",
  ],
  alternates: {
    canonical: "/classes",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir/classes",
    siteName: "تک‌یاد | Tecyad",
    title: "کلاس‌های آنلاین، کارگاه‌های زنده و وبینارهای تخصصی | تک‌یاد (Tecyad)",
    description: "شرکت در کلاس‌های تعاملی آنلاین، کارگاه‌های پروژه‌محور و جلسات رفع اشکال با ظرفیت محدود در آکادمی تک‌یاد (Tecyad).",
    images: [
      {
        url: "https://picsum.photos/seed/tecyad-classes/1200/630",
        width: 1200,
        height: 630,
        alt: "کلاس‌های آنلاین تک‌یاد Tecyad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "کلاس‌های آنلاین، کارگاه‌های زنده و وبینارهای تخصصی | تک‌یاد (Tecyad)",
    description: "شرکت در کلاس‌های تعاملی آنلاین و کارگاه‌های پروژه‌محور با ظرفیت محدود در تک‌یاد (Tecyad).",
    images: ["https://picsum.photos/seed/tecyad-classes/1200/630"],
  },
};

export default function ClassesPage() {
  const classesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "کلاس‌های آنلاین و وبینارهای تک‌یاد | Tecyad",
    "description": "فهرست کارگاه‌ها و کلاس‌های زنده تعاملی در پلتفرم تک‌یاد (Tecyad)",
    "url": "https://tecyad.ir/classes",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد | Tecyad",
      "url": "https://tecyad.ir"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(classesJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">درحال بارگذاری کلاس‌ها...</div>}>
        <ClassesList />
      </Suspense>
    </>
  );
}
