import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ورود به حساب کاربری | تک‌یاد',
  description: 'ورود به پنل کاربری دانشجویان، اساتید و مدیران تک‌یاد',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
