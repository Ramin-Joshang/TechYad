import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سوالات متداول دانشجویان و راهنمای ثبت‌نام | تک‌یاد',
  description: 'پاسخ به سوالات پرتکرار پیرامون نحوه ثبت‌نام در دوره‌ها، نحوه برگزاری کلاس‌های آنلاین و حضوری، شرایط دریافت گواهینامه، پرداخت و پشتیبانی در تک‌یاد.',
  keywords: [
    'سوالات متداول تک‌یاد',
    'راهنمای ثبت‌نام تک‌یاد',
    'شرایط کلاس آنلاین',
    'مدرک معتبر تک‌یاد',
    'پشتیبانی دوره‌ها',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/faq',
    title: 'سوالات متداول دانشجویان و راهنما | تک‌یاد',
    description: 'پاسخ به سوالات پرتکرار پیرامون ثبت‌نام، برگزاری کلاس‌ها و مدارک آموزشی در تک‌یاد.',
  },
};

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "چگونه می‌توانم در دوره‌های آموزشی تک‌یاد ثبت‌نام کنم؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "کافی است پس از ورود یا ثبت‌نام در سایت، دوره مورد نظر خود را انتخاب کرده و با زدن دکمه ثبت‌نام یا افزودن به سبد خرید، فرآیند خرید را تکمیل کنید."
      }
    },
    {
      "@type": "Question",
      "name": "آیا دوره‌های تک‌یاد دارای گواهینامه معتبر هستند؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، پس از اتمام دوره و انجام پروژه‌ها یا آزمون‌های تعیین‌شده توسط استاد، مدرک دیجیتال قابل استعلام دریافت خواهید کرد."
      }
    },
    {
      "@type": "Question",
      "name": "آیا امکان ارتباط مستقیم با استاد دوره وجود دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، در بخش دیدگاه‌های دوره و همچنین در کلاس‌های آنلاین، دانشجویان امکان پرسش و پاسخ مستقیم و رفع اشکال با استاد را دارند."
      }
    }
  ]
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      {children}
    </>
  );
}
