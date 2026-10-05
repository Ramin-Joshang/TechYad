import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست‌های حفظ حریم خصوصی، امنیت داده‌ها و اطلاعات کاربران در سامانه آموزشی تک‌یاد.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/privacy',
    siteName: 'تک‌یاد | Tecyad',
    title: 'حریم خصوصی | تک‌یاد',
    description: 'سیاست‌های حفظ حریم خصوصی، امنیت داده‌ها و اطلاعات کاربران در سامانه آموزشی تک‌یاد.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
