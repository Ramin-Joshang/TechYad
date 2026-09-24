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
    'Tecyad',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/blog',
    siteName: 'تک‌یاد | Tecyad',
    title: 'وبلاگ تخصصی و مقالات آموزشی | تک‌یاد (Tecyad)',
    description: 'تازه‌ترین مقالات آموزشی، راهنماهای کاربردی برنامه‌نویسی و هوش مصنوعی در وبلاگ تک‌یاد (Tecyad).',
    images: [
      {
        url: 'https://picsum.photos/seed/tecyad-blog/1200/630',
        width: 1200,
        height: 630,
        alt: 'وبلاگ تک‌یاد Tecyad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'وبلاگ تخصصی و مقالات آموزشی | تک‌یاد (Tecyad)',
    description: 'تازه‌ترین مقالات آموزشی، راهنماهای کاربردی برنامه‌نویسی و فناوری در تک‌یاد (Tecyad).',
    images: ['https://picsum.photos/seed/tecyad-blog/1200/630'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
