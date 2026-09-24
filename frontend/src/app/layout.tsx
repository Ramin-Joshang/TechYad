import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/QueryProvider";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tekyad.ir'),
  title: {
    default: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    template: "%s | تک‌یاد"
  },
  description: "سامانه جامع یادگیری آنلاین تک‌یاد؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر، پروژه‌محور و گواهی معتبر.",
  keywords: [
    "آموزش آنلاین",
    "دوره‌های برنامه‌نویسی",
    "کلاس آنلاین",
    "تک‌یاد",
    "یادگیری مهارت",
    "آموزش هوش مصنوعی",
    "آموزش پایتون",
    "طراحی وب",
    "گواهینامه معتبر",
    "کیف پول آموزشی",
    "آموزشگاه مجازی"
  ],
  authors: [{ name: "تک‌یاد", url: "https://tekyad.ir" }],
  creator: "تک‌یاد - سامانه مدیریت آموزش",
  publisher: "تک‌یاد",
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
    url: "https://tekyad.ir",
    siteName: "تک‌یاد",
    title: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه جامع یادگیری آنلاین تک‌یاد؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر و گواهی معتبر.",
    images: [
      {
        url: "https://picsum.photos/seed/tekyad-banner/1200/630",
        width: 1200,
        height: 630,
        alt: "تک‌یاد - سامانه یادگیری آنلاین",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تک‌یاد | پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی",
    description: "سامانه جامع یادگیری آنلاین تک‌یاد؛ مرجع تخصصی دوره‌های برنامه‌نویسی، طراحی وب، هوش مصنوعی و مهارت‌های دانشگاهی با اساتید برتر و گواهی معتبر.",
    images: ["https://picsum.photos/seed/tekyad-banner/1200/630"],
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
        "@id": "https://tekyad.ir/#organization",
        "name": "تک‌یاد",
        "url": "https://tekyad.ir",
        "logo": "https://picsum.photos/seed/tekyad-logo/512/512",
        "description": "پلتفرم جامع آموزش آنلاین، دوره‌ها و کلاس‌های تخصصی دانشگاهی و مهندسی",
        "sameAs": [
          "https://twitter.com/tekyad",
          "https://instagram.com/tekyad",
          "https://linkedin.com/company/tekyad"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://tekyad.ir/#website",
        "url": "https://tekyad.ir",
        "name": "تک‌یاد",
        "publisher": { "@id": "https://tekyad.ir/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://tekyad.ir/search?q={search_term_string}",
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
