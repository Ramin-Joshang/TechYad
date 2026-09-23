import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ثبت‌نام و عضویت | تک‌یاد',
  description: 'ایجاد حساب کاربری جدید و پیوستن به خانواده بزرگ دانشجویان و متخصصان تک‌یاد',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
