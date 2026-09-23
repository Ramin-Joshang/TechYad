import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'جستجوی هوشمند در دوره‌ها و مقالات | تک‌یاد',
  description: 'جستجوی دوره‌های آموزشی، اساتید، وبینارها و مقالات تخصصی در پلتفرم تک‌یاد',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
