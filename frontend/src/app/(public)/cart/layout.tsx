import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سبد خرید شما | تک‌یاد',
  description: 'مشاهده دوره‌ها و کارگاه‌های آموزشی انتخابی و تسویه حساب در تک‌یاد.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
