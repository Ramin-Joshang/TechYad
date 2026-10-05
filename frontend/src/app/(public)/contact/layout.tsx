import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description: 'ارتباط مستقیم با تیم پشتیبانی تک‌یاد؛ شماره تماس، پشتیبانی واتس‌اپ و تلگرام، ایمیل سازمانی و فرم ارسال پیام.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/contact',
    siteName: 'تک‌یاد | Tecyad',
    title: 'تماس با ما | تک‌یاد',
    description: 'ارتباط مستقیم با تیم پشتیبانی تک‌یاد؛ شماره تماس، پشتیبانی واتس‌اپ و تلگرام، ایمیل سازمانی و فرم ارسال پیام.',
    images: [
      {
        url: 'https://picsum.photos/seed/tecyad-contact/1200/630',
        width: 1200,
        height: 630,
        alt: 'تماس با تک‌یاد',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تماس با ما | تک‌یاد',
    description: 'راه‌های ارتباطی و پشتیبانی تک‌یاد از طریق تلگرام، واتس‌اپ، تلفن و فرم پیام.',
    images: ['https://picsum.photos/seed/tecyad-contact/1200/630'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
