import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین و مقررات',
  description: 'قوانین و مقررات استفاده از خدمات، دوره‌ها و کلاس‌های آنلاین پلتفرم آموزشی تک‌یاد.',
  alternates: {
    canonical: '/rules',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/rules',
    siteName: 'تک‌یاد | Tecyad',
    title: 'قوانین و مقررات | تک‌یاد',
    description: 'قوانین و مقررات استفاده از خدمات، دوره‌ها و کلاس‌های آنلاین پلتفرم آموزشی تک‌یاد.',
  },
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
