import { HomeDataView } from "@/components/home/HomeDataView";
import { fetchHomeData } from "@/lib/server-api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی برنامه‌نویسی",
  description: "سامانه آموزش آنلاین تک‌یاد (Tecyad)؛ مرجع تخصصی دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب، هوش مصنوعی، کلاس‌های زنده و کارگاه‌های مهارتی با برترین اساتید ایران.",
  keywords: [
    "آموزش برنامه‌نویسی",
    "کلاس آنلاین",
    "دوره آموزش پایتون",
    "دوره آموزش طراحی وب",
    "هوش مصنوعی",
    "تک‌یاد",
    "Tecyad",
    "آموزشگاه مجازی",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir",
    siteName: "تک‌یاد | Tecyad",
    title: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه آموزش آنلاین تک‌یاد؛ مرجع تخصصی دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و هوش مصنوعی با برترین اساتید.",
    images: [
      {
        url: "https://picsum.photos/seed/tecyad-home/1200/630",
        width: 1200,
        height: 630,
        alt: "آکادمی آموزشی تک‌یاد Tecyad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "مرجع تخصصی دوره‌های برنامه‌نویسی، کلاس‌های آنلاین و کارگاه‌های مهارتی.",
    images: ["https://picsum.photos/seed/tecyad-home/1200/630"],
  },
};

export default async function HomePage() {
  const homeData = await fetchHomeData();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "تک‌یاد | Tecyad",
    "url": "https://tecyad.ir",
    "description": "پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tecyad.ir/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "تک‌یاد | Tecyad",
    "url": "https://tecyad.ir",
    "logo": "https://tecyad.ir/logo.png",
    "telephone": "09372731037",
    "sameAs": [
      "https://t.me/tecyad_ir",
      "https://instagram.com/tecyad.ir"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeDataView initialData={homeData} />
    </>
  );
}
