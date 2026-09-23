import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/QueryProvider";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "تک‌یاد | پلتفرم جامع آموزش آنلاین و دانشگاهی",
    template: "%s | تک‌یاد"
  },
  description: "سامانه جامع یادگیری آنلاین، آموزش مهارت‌های فنی، مهندسی و دوره‌های تخصصی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased"
      suppressHydrationWarning
    >
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
