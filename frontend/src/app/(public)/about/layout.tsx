import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره ما | پلتفرم آموزش تخصصی و آنلاین تک‌یاد',
  description: 'آشنایی با آکادمی آنلاین تک‌یاد (Tecyad)؛ تاریخچه، اهداف، چشم‌انداز آموزشی و تعهد ما به توانمندسازی دانشجویان با برترین اساتید و آموزش‌های مهارتی.',
  keywords: [
    'درباره تک‌یاد',
    'آکادمی تک‌یاد',
    'آموزشگاه آنلاین',
    'یادگیری مهارت',
    'Tecyad',
    'تیم آموزشی تک‌یاد',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/about',
    title: 'درباره ما | پلتفرم آموزش تخصصی تک‌یاد (Tecyad)',
    description: 'آشنایی با آکادمی آنلاین تک‌یاد؛ تاریخچه، اهداف و تعهد به توانمندسازی مهارتی دانشجویان.',
    images: [
      {
        url: 'https://picsum.photos/seed/about/1200/630',
        width: 1200,
        height: 630,
        alt: 'درباره تک‌یاد',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'درباره ما | پلتفرم آموزش تخصصی تک‌یاد',
    description: 'آشنایی با آکادمی آنلاین تک‌یاد و چشم‌انداز آموزش مهارتی در ایران.',
    images: ['https://picsum.photos/seed/about/1200/630'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
