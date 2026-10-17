import { HomeDataView } from "@/components/home/HomeDataView";
import { fetchHomeData } from "@/lib/server-api";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "آکادمی تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی برنامه‌نویسی",
  description: "سامانه آموزش آنلاین آکادمی تک‌یاد (Tecyad)؛ مرجع تخصصی دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب، هوش مصنوعی، کلاس‌های زنده و کارگاه‌های مهارتی با برترین اساتید ایران.",
  keywords: [
    "آکادمی تک‌یاد",
    "آکادمی تک یاد",
    "تک‌یاد",
    "تک یاد",
    "تکیاد",
    "Tecyad",
    "Tecyad Academy",
    "آموزش برنامه‌نویسی",
    "کلاس آنلاین",
    "دوره آموزش پایتون",
    "دوره آموزش طراحی وب",
    "هوش مصنوعی",
    "آموزشگاه مجازی",
  ],
  alternates: {
    canonical: "https://tecyad.ir",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir",
    siteName: "آکادمی تک‌یاد | Tecyad",
    title: "آکادمی تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه آموزش آنلاین آکادمی تک‌یاد؛ مرجع تخصصی دوره‌های پروژه‌محور برنامه‌نویسی، طراحی وب و هوش مصنوعی با برترین اساتید.",
    images: [
      {
        url: "https://tecyad.ir/hero-image.png",
        width: 1200,
        height: 630,
        alt: "آکادمی تک‌یاد Tecyad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آکادمی تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "مرجع تخصصی دوره‌های برنامه‌نویسی، کلاس‌های آنلاین و کارگاه‌های مهارتی در آکادمی تک‌یاد.",
    images: ["https://tecyad.ir/hero-image.png"],
  },
};

export default async function HomePage() {
  const homeData = await fetchHomeData();

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "آکادمی تک‌یاد",
    "alternateName": [
      "آکادمی تک یاد",
      "تک‌یاد",
      "تک یاد",
      "تکیاد",
      "Tecyad"
    ],
    "url": "https://tecyad.ir",
    "description": "پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی آکادمی تک‌یاد",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tecyad.ir/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "آکادمی تک‌یاد",
    "alternateName": [
      "آکادمی تک یاد",
      "تک‌یاد",
      "تک یاد",
      "تکیاد",
      "Tecyad Academy",
      "Tecyad"
    ],
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
