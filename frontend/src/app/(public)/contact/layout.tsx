import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تماس با ما و ارتباط مستقیم | تک یاد",
  description:
    "راه‌های ارتباطی با پشتیبانی تک یاد؛ شماره تلفن مستقیم، پیام در تلگرام، واتس‌اپ، اینستاگرام، آدرس دفتر مرکزی و فرم ارسال پیام آنلاین.",
  keywords: [
    "تماس با تک یاد",
    "پشتیبانی تک یاد",
    "شماره تماس آموزشگاه آنلاین",
    "مشاوره رایگان تک یاد",
    "آدرس تک یاد",
    "Tecyad Contact",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir/contact",
    title: "تماس با ما | پلتفرم آموزش آنلاین تک یاد (Tecyad)",
    description:
      "راه‌های ارتباطی مستقیم، پشتیبانی تلفنی، تلگرام و واتس‌اپ با کارشناسان تک یاد.",
    images: [
      {
        url: "https://tecyad.ir/hero-image.png",
        width: 1200,
        height: 630,
        alt: "تماس با تک یاد",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تماس با ما | تک یاد",
    description: "راه‌های ارتباطی مستقیم و پشتیبانی آنلاین در تک یاد.",
    images: ["https://tecyad.ir/hero-image.png"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
