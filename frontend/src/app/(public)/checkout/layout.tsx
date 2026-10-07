import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تکمیل سفارش و درگاه پرداخت | تک‌یاد',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
