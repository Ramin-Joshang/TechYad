import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'فراموشی و بازیابی رمز عبور | تک‌یاد',
  description: 'بازیابی رمز عبور حساب کاربری در پلتفرم آموزشی تک‌یاد',
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
