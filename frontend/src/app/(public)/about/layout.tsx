import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'آشنایی با آکادمی آموزشی تک‌یاد؛ داستان شکل‌گیری، مأموریت، چشم‌انداز، ارزش‌ها و اساتید مجرب در ارتقای مهارت‌های تخصصی.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/about',
    siteName: 'تک‌یاد | Tecyad',
    title: 'درباره ما | تک‌یاد',
    description: 'آشنایی با آکادمی آموزشی تک‌یاد؛ داستان شکل‌گیری، مأموریت، چشم‌انداز، ارزش‌ها و اساتید مجرب در ارتقای مهارت‌های تخصصی.',
    images: [
      {
        url: 'https://picsum.photos/seed/tecyad-about/1200/630',
        width: 1200,
        height: 630,
        alt: 'درباره تک‌یاد',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'درباره ما | تک‌یاد',
    description: 'آشنایی با آکادمی آموزشی تک‌یاد؛ مأموریت و چشم‌انداز در ارتقای آموزش مهارت‌های فنی و دانشگاهی.',
    images: ['https://picsum.photos/seed/tecyad-about/1200/630'],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
