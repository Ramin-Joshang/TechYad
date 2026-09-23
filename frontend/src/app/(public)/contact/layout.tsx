import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با ما | تک‌یاد',
  description: 'ارتباط مستقیم با تیم پشتیبانی، مشاوره آموزشی، آدرس و شماره تلفن‌های تک‌یاد',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
