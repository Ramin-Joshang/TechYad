import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'وبلاگ تخصصی و مقالات آموزشی | تک‌یاد',
  description: 'تازه‌ترین مقالات آموزشی، راهنماهای کاربردی برنامه‌نویسی، هوش مصنوعی، فناوری اطلاعات و نکات تخصصی شغلی در وبلاگ تک‌یاد.',
  keywords: [
    'وبلاگ آموزشی',
    'مقالات برنامه‌نویسی',
    'آموزش هوش مصنوعی',
    'تکنولوژی',
    'تک‌یاد',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tekyad.ir/blog',
    siteName: 'تک‌یاد',
    title: 'وبلاگ تخصصی و مقالات آموزشی | تک‌یاد',
    description: 'تازه‌ترین مقالات آموزشی، راهنماهای کاربردی برنامه‌نویسی و هوش مصنوعی در وبلاگ تک‌یاد.',
    images: [
      {
        url: 'https://picsum.photos/seed/tekyad-blog/1200/630',
        width: 1200,
        height: 630,
        alt: 'وبلاگ تک‌یاد',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وبلاگ تخصصی و مقالات آموزشی | تک‌یاد',
    description: 'تازه‌ترین مقالات آموزشی، راهنماهای کاربردی برنامه‌نویسی و فناوری در تک‌یاد.',
    images: ['https://picsum.photos/seed/tekyad-blog/1200/630'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
