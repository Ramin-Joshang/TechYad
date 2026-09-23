import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فرصت‌های شغلی و همکاری | تک‌یاد',
  description: 'به تیم خلاق و پیشرو تک‌یاد بپیوندید؛ مشاهده فرصت‌های شغلی تدریس و توسعه',
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
