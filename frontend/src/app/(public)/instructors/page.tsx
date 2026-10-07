import { InstructorsList } from '@/components/instructors/InstructorsList';
import { fetchInstructors } from '@/lib/server-api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "اساتید و مدرسان برجسته | تک‌یاد",
  description: "آشنایی با اساتید متخصص و حرفه‌ای تک‌یاد در حوزه‌های برنامه‌نویسی، طراحی محصول، هوش مصنوعی، داده و مهندسی نرم‌افزار.",
  keywords: [
    "اساتید تک‌یاد",
    "مدرسان برنامه‌نویسی",
    "اساتید هوش مصنوعی",
    "آموزشگاه آنلاین",
    "اساتید مجرب",
    "تک‌یاد",
    "Tecyad",
  ],
  alternates: {
    canonical: "/instructors",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir/instructors",
    siteName: "تک‌یاد | Tecyad",
    title: "اساتید و مدرسان برجسته | تک‌یاد (Tecyad)",
    description: "آشنایی با اساتید متخصص و حرفه‌ای تک‌یاد (Tecyad) در حوزه‌های برنامه‌نویسی، طراحی محصول و هوش مصنوعی.",
    images: [
      {
        url: "https://picsum.photos/seed/tecyad-instructors/1200/630",
        width: 1200,
        height: 630,
        alt: "اساتید تک‌یاد Tecyad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "اساتید و مدرسان برجسته | تک‌یاد (Tecyad)",
    description: "آشنایی با اساتید متخصص و حرفه‌ای تک‌یاد (Tecyad) در حوزه‌های تخصصی نرم‌افزار.",
    images: ["https://picsum.photos/seed/tecyad-instructors/1200/630"],
  },
};

export default async function InstructorsPage() {
  const instructors = await fetchInstructors();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "اساتید و مدرسان تک‌یاد | Tecyad",
    "description": "فهرست اساتید متخصص و حرفه‌ای تک‌یاد در حوزه‌های برنامه‌نویسی و مهندسی نرم‌افزار",
    "url": "https://tecyad.ir/instructors",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <InstructorsList initialData={instructors} />
    </>
  );
}
