import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با ما و ارتباط مستقیم | تک‌یاد',
  description: 'راه‌های ارتباطی با پشتیبانی تک‌یاد؛ شماره تلفن مستقیم، پیام در تلگرام، واتس‌اپ، اینستاگرام، آدرس دفتر مرکزی و فرم ارسال پیام آنلاین.',
  keywords: [
    'تماس با تک‌یاد',
    'پشتیبانی تک‌یاد',
    'شماره تماس آموزشگاه آنلاین',
    'مشاوره رایگان تک‌یاد',
    'آدرس تک‌یاد',
    'Tecyad Contact',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/contact',
    title: 'تماس با ما | پلتفرم آموزش آنلاین تک‌یاد (Tecyad)',
    description: 'راه‌های ارتباطی مستقیم، پشتیبانی تلفنی، تلگرام و واتس‌اپ با کارشناسان تک‌یاد.',
    images: [
      {
        url: 'https://picsum.photos/seed/contact/1200/630',
        width: 1200,
        height: 630,
        alt: 'تماس با تک‌یاد',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تماس با ما | تک‌یاد',
    description: 'راه‌های ارتباطی مستقیم و پشتیبانی آنلاین در تک‌یاد.',
    images: ['https://picsum.photos/seed/contact/1200/630'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
