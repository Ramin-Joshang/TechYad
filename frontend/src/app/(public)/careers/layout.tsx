import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فرصت‌های شغلی و همکاری با تک‌یاد',
  description: 'پیوستن به تیم خلاق تک‌یاد؛ جذب مدرس، برنامه‌نویس، طراح و کارشناسان تولید محتوا و پشتیبانی آموزشی.',
  alternates: {
    canonical: '/careers',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/careers',
    title: 'فرصت‌های شغلی | تک‌یاد',
    description: 'همکاری و استخدام در مجموعه آموزشی تک‌یاد.',
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
