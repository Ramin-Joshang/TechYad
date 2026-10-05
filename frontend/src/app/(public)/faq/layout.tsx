import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سوالات متداول',
  description: 'پاسخ به سوالات پرتکرار درباره ثبت‌نام در دوره‌ها، مدارک پایان‌دوره، کلاس‌های آنلاین و نحوه پرداخت در تک‌یاد.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/faq',
    siteName: 'تک‌یاد | Tecyad',
    title: 'سوالات متداول | تک‌یاد',
    description: 'پاسخ به سوالات پرتکرار درباره ثبت‌نام در دوره‌ها، مدارک پایان‌دوره، کلاس‌های آنلاین و نحوه پرداخت در تک‌یاد.',
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
