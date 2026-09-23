import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'وبلاگ و مقالات تخصصی | تک‌یاد',
  description: 'تازه‌ترین مقالات آموزشی، راهنماهای برنامه‌نویسی، هوش مصنوعی، مهندسی و نکات تحصیلی',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
