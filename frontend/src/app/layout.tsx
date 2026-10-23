import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { iranYekan } from "@/app/fonts";
import { QueryProvider } from "@/lib/QueryProvider";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopContactBar } from "@/components/layout/TopContactBar";
import { FloatingContactWidget } from "@/components/common/FloatingContactWidget";
import { ReferralCapture } from "@/components/common/ReferralCapture";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tecyad.ir"),
  title: {
    default: "آکادمی تک یاد | کلاس‌های آنلاین و دوره‌های تخصصی",
    template: "%s | آکادمی تک یاد",
  },
  description:
    "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و آموزش‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب. مشاهده دوره‌ها و ثبت‌نام آنلاین.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      {
        url: "/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "آکادمی تک یاد",
    "تک یاد",
    "تک‌یاد",
    "تکیاد",
    "TechYad",
    "Tecyad",
    "Tecyad Academy",
    "کلاس آنلاین",
    "دوره‌های برنامه‌نویسی",
    "آموزش دروس دانشگاهی",
    "آموزش هوش مصنوعی",
    "آموزش مهندسی برق",
    "آموزش پایتون",
    "طراحی وب",
    "ثبت‌نام کلاس آنلاین",
  ],
  authors: [{ name: "آکادمی تک یاد (TechYad)", url: "https://tecyad.ir" }],
  creator: "آکادمی تک یاد",
  publisher: "آکادمی تک یاد",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
      "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و آموزش‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب.",
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
      "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین و آموزش‌های تخصصی دروس دانشگاهی، مهندسی، برنامه‌نویسی و هوش مصنوعی با اساتید مجرب.",
    images: ["https://tecyad.ir/hero-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://tecyad.ir/#organization",
        name: "آکادمی تک یاد",
        alternateName: [
          "تک یاد",
          "تک‌یاد",
          "تکیاد",
          "TechYad",
          "Tecyad",
          "Tecyad Academy",
          "آکادمی تک‌یاد",
        ],
        url: "https://tecyad.ir",
        logo: "https://tecyad.ir/logo.png",
        description:
          "آکادمی تک یاد؛ برگزارکننده کلاس‌های آنلاین، آموزش‌های تخصصی و دروس دانشگاهی با اساتید برتر",
        sameAs: [
          "https://t.me/tecyad_ir",
          "https://www.instagram.com/tecyad.ir/",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+989372731037",
          contactType: "customer support",
          areaServed: "IR",
          availableLanguage: ["Persian"],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://tecyad.ir/#website",
        url: "https://tecyad.ir",
        name: "آکادمی تک یاد",
        alternateName: [
          "تک یاد",
          "تک‌یاد",
          "TechYad",
          "Tecyad",
        ],
        publisher: { "@id": "https://tecyad.ir/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://tecyad.ir/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`h-full antialiased ${iranYekan.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google Analytics 4 (GA4) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-DEL38ZFL1T"
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DEL38ZFL1T', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        dir="rtl"
        className={`min-h-full flex flex-col font-sans bg-gray-50 text-gray-900 overflow-x-hidden text-right ${iranYekan.className}`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ReferralCapture />
            </Suspense>
            <TopContactBar />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <FloatingContactWidget />
            <Toaster position="top-center" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
