import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/QueryProvider";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir'),
  title: {
    default: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی (Tecyad)",
    template: "%s | تک‌یاد - Tecyad"
  },
  description: "سامانه جامع یادگیری آنلاین تک‌یاد (Tecyad)؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر، پروژه‌محور و گواهی معتبر.",
  keywords: [
    "آموزش آنلاین",
    "دوره‌های برنامه‌نویسی",
    "کلاس آنلاین",
    "تک‌یاد",
    "Tecyad",
    "یادگیری مهارت",
    "آموزش هوش مصنوعی",
    "آموزش پایتون",
    "طراحی وب",
    "گواهینامه معتبر",
    "کیف پول آموزشی",
    "آموزشگاه مجازی"
  ],
  authors: [{ name: "تک‌یاد (Tecyad)", url: "https://tecyad.ir" }],
  creator: "تک‌یاد - سامانه مدیریت آموزش Tecyad",
  publisher: "تک‌یاد | Tecyad",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://tecyad.ir",
    siteName: "تک‌یاد | Tecyad",
    title: "تک‌یاد (Tecyad) | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه جامع یادگیری آنلاین تک‌یاد (Tecyad)؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر و گواهی معتبر.",
    images: [
      {
        url: "https://picsum.photos/seed/tecyad-banner/1200/630",
        width: 1200,
        height: 630,
        alt: "تک‌یاد - سامانه یادگیری آنلاین Tecyad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تک‌یاد (Tecyad) | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه جامع یادگیری آنلاین تک‌یاد (Tecyad)؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر و گواهی معتبر.",
    images: ["https://picsum.photos/seed/tecyad-banner/1200/630"],
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
        "name": "تک‌یاد | Tecyad",
        "url": "https://tecyad.ir",
        "logo": "https://picsum.photos/seed/tecyad-logo/512/512",
        "description": "پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی دانشگاهی و مهندسی",
        "sameAs": [
          "https://twitter.com/tecyad",
          "https://instagram.com/tecyad",
          "https://linkedin.com/company/tecyad"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://tecyad.ir/#website",
        "url": "https://tecyad.ir",
        "name": "تک‌یاد | Tecyad",
        "publisher": { "@id": "https://tecyad.ir/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://tecyad.ir/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900"
        style={{ fontFamily: "'Vazirmatn', sans-serif" }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <Toaster position="top-center" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
