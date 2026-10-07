import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین و مقررات استفاده از خدمات | تک‌یاد',
  description: 'قوانین و مقررات آموزشی، حریم خصوصی، شرایط بازپرداخت شهریه و حقوق مالکیت فکری محتوای آموزشی در پلتفرم آنلاین تک‌یاد.',
  alternates: {
    canonical: '/rules',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/rules',
    title: 'قوانین و مقررات تک‌یاد',
    description: 'قوانین و مقررات آموزشی و شرایط استفاده از خدمات تک‌یاد.',
  },
};

export default function RulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
