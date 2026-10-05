import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فرصت‌های شغلی و استخدام',
  description: 'به تیم خلاق و پیشرو تک‌یاد بپیوندید؛ مشاهده فرصت‌های شغلی تدریس، توسعه نرم‌افزار و پشتیبانی آموزشی.',
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
