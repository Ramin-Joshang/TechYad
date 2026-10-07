import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سیاست حفظ حریم خصوصی کاربران | تک‌یاد',
  description: 'تعهدات تک‌یاد در زمینه حفظ و صیانت از اطلاعات خصوصی، امنیت داده‌های کاربران، تراکنش‌ها و حریم شخصی دانش‌پذیران.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/privacy',
    title: 'حریم خصوصی | تک‌یاد',
    description: 'تعهدات تک‌یاد در زمینه صیانت از داده‌ها و حریم خصوصی کاربران.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
