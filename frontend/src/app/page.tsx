import { HomeDataView } from "@/components/home/HomeDataView";
import { fetchHomeData } from "@/lib/server-api";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "آکادمی تک یاد | کلاس‌های آنلاین و دوره‌های تخصصی",
  description:
    "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و دوره‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب. مشاهده دوره‌ها و ثبت‌نام آنلاین.",
  keywords: [
    "آکادمی تک یاد",
    "تک یاد",
    "تک‌یاد",
    "تکیاد",
    "TechYad",
    "Tecyad",
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
    siteName: "آکادمی تک یاد",
    title: "آکادمی تک یاد | کلاس‌های آنلاین و دوره‌های تخصصی",
    description:
      "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و دوره‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب.",
    images: [
      {
        url: "https://tecyad.ir/hero-image.png",
        width: 1200,
        height: 630,
        alt: "آکادمی تک یاد - کلاس‌های آنلاین و دوره‌های تخصصی",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "آکادمی تک یاد | کلاس‌های آنلاین و دوره‌های تخصصی",
    description:
      "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و دوره‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب.",
    images: ["https://tecyad.ir/hero-image.png"],
  },
};

export default async function HomePage() {
  const homeData = await fetchHomeData();

  return (
    <>
      <HomeDataView initialData={homeData} />
    </>
  );
}
