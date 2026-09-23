import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سوالات متداول (FAQ) | تک‌یاد',
  description: 'پاسخ به سوالات پرتکرار درباره خرید دوره‌ها، مدارک پایان‌دوره و نحوه مشاهده کلاس‌ها',
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
