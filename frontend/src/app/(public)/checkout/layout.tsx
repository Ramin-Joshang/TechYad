import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسویه حساب و پرداخت | تک‌یاد',
  description: 'نهایی‌سازی سفارش و اتصال به درگاه پرداخت اینترنتی تک‌یاد',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
