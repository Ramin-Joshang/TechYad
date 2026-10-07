import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'جستجو در دوره‌ها، کلاس‌ها، اساتید و مقالات | تک‌یاد',
  description: 'جستجوی هوشمند در تمامی دوره‌ها، وبینارها، کارگاه‌ها، رزومه اساتید و مقالات تخصصی آموزشگاه آنلاین تک‌یاد (Tecyad).',
  robots: {
    index: false, // Prevent Google from indexing search query results
    follow: true,
  },
  alternates: {
    canonical: '/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
