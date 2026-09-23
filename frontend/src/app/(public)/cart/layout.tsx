import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سبد خرید | تک‌یاد',
  description: 'مشاهده دوره‌ها و کلاس‌های انتخاب شده در سبد خرید تک‌یاد',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
