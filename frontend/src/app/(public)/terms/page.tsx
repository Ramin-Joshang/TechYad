import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "قوانین، شرایط خرید و انصراف | آکادمی تک یاد",
  description:
    "قوانین و مقررات رسمی ثبت‌نام در دوره‌ها، کارگاه‌های زنده، شرایط خرید نقدی و اقساطی اسنپ‌پی، مهلت‌های انصراف و فرآیند بازگشت وجه در آکادمی تک یاد.",
  keywords: [
    "قوانین آکادمی تک یاد",
    "شرایط خرید تک یاد",
    "انصراف از دوره",
    "بازگشت وجه",
    "اقساط اسنپ پی",
    "آکادمی تک یاد",
    "تک یاد",
  ],
  alternates: {
    canonical: "https://tecyad.ir/terms",
  },
  openGraph: {
    title: "قوانین، شرایط خرید و انصراف | آکادمی تک یاد",
    description:
      "مقررات رسمی ثبت‌نام، خرید اقساطی، شرایط انصراف و استرداد وجه در آکادمی تک یاد (Tecyad)",
    url: "https://tecyad.ir/terms",
    siteName: "آکادمی تک یاد | Tecyad",
    locale: "fa_IR",
    type: "website",
  },
};

export default function TermsPage() {
  const termsJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "قوانین، شرایط خرید و انصراف آکادمی تک یاد",
    description:
      "قوانین رسمی ثبت‌نام، پرداخت، انصراف و استرداد وجه در آکادمی تک یاد",
    url: "https://tecyad.ir/terms",
    publisher: {
      "@type": "EducationalOrganization",
      name: "آکادمی تک یاد",
      alternateName: ["آکادمی تک یاد", "تک یاد", "تک یاد", "تکیاد", "Tecyad"],
      url: "https://tecyad.ir",
      logo: "https://tecyad.ir/logo.png",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      <main
        className="bg-[var(--neo-bg)] min-h-screen py-12 sm:py-16 text-right"
        dir="rtl"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-[var(--neo-primary)] border border-blue-100 mb-5 shadow-xs">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--neo-text-main)] mb-3">
              قوانین، شرایط خرید و انصراف
            </h1>
            <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              راهنمای رسمی و شفاف آکادمی تک یاد پیرامون ثبت‌نام، شرایط پرداخت
              نقدی و اقساطی، مهلت انصراف و رویه استرداد وجه.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              <span>آخرین بازبینی و به‌روزرسانی: مهر ۱۴۰۵</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">
                مصوب مدیریت آکادمی تک یاد
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--neo-border)] space-y-10">
            {/* ۱. شرایط عمومی ثبت‌نام و حساب کاربری */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  ۱
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  شرایط عمومی ثبت‌نام و حساب کاربری
                </h2>
              </div>
              <div className="text-sm text-slate-600 leading-loose space-y-3">
                <p>
                  ثبت‌نام در هر یک از دوره‌ها یا کلاس‌های{" "}
                  <strong>«آکادمی تک یاد»</strong> به منزله مطالعه دقیق، آگاهی
                  کامل و پذیرش بدون قید و شرط این قوانین است.
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-slate-700">
                  <li>
                    کاربر متعهد است کلیه اطلاعات هویتی (نام، نام خانوادگی، شماره
                    تماس معتبر و کدملی) را با صحت کامل وارد کند. صدور
                    گواهینامه‌های رسمی بر مبنای اطلاعات مندرج در پروفایل انجام
                    می‌شود.
                  </li>
                  <li>
                    هر حساب کاربری منحصراً متعلق به یک شخص حقیقی است.
                    اشتراک‌گذاری شناسه کاربری یا دسترسی مشترک به محتوا ممنوع
                    بوده و منجر به مسدودسازی دائمی حساب بدون استرداد وجه خواهد
                    شد.
                  </li>
                </ul>
              </div>
            </section>

            {/* ۲. فرآیند خرید نقدی و دسترسی آنی */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  ۲
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  روش‌های خرید نقدی و دسترسی به دوره‌ها
                </h2>
              </div>
              <div className="text-sm text-slate-600 leading-loose space-y-3">
                <p>
                  در پرداخت نقدی، شهریه پس از اعمال تخفیفات معتبر و از طریق
                  درگاه‌های امن شاپرک (درگاه سامان / سپ) یا از محل اعتبار کیف
                  پول آموزشی پرداخت می‌شود.
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-slate-700">
                  <li>
                    <strong>دوره‌های ویدئویی:</strong> بلافاصله پس از تکمیل
                    تراکنش بانکی، دسترسی نامحدود به تمامی جلسات و سرفصل‌ها در
                    پنل کاربری دانشجو فعال می‌گردد.
                  </li>
                  <li>
                    <strong>کلاس‌های آنلاین زنده:</strong> لینک ورود به بستر
                    کلاس (اسکای‌روم یا گوگل میت) و تقویم جلسات در بخش «کلاس‌های
                    من» فعال شده و ویدیوهای ضبط‌شده پس از هر جلسه بارگذاری
                    می‌شوند.
                  </li>
                </ul>
              </div>
            </section>

            {/* ۳. شرایط پرداخت اقساطی اسنپ‌پی (بدون کارمزد) */}
            <section className="space-y-4 bg-purple-50/50 p-5 sm:p-6 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 border-b border-purple-200/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                  ۳
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-purple-950">
                  شرایط پرداخت اقساطی ۴ ماهه اسنپ‌پی (بدون کارمزد)
                </h2>
              </div>
              <div className="text-sm text-purple-900 leading-loose space-y-3">
                <p>
                  به منظور تسهیل یادگیری دانشجویان، امکان پرداخت اقساطی در ۴
                  مرحله ماهانه از طریق همکاری با اسنپ‌پی بدون چک، بدون ضامن و با{" "}
                  <strong>۰٪ کارمزد اضافی</strong> فراهم شده است:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-purple-950">
                  <li>
                    <strong>قسط اول (پیش‌پرداخت ۲۵٪):</strong> در هنگام تکمیل
                    سفارش از طریق درگاه اسنپ‌پی پرداخت می‌شود و دسترسی کامل به
                    دوره/کلاس بلافاصله فعال می‌گردد.
                  </li>
                  <li>
                    <strong>اقساط دوم، سوم و چهارم:</strong> به ترتیب در فواصل
                    یک‌ماهه پس از تاریخ ثبت‌نام از حساب کاربری اسنپ‌پی کاربر
                    پرداخت خواهند شد.
                  </li>
                  <li>
                    تعهد تسویه اقساط بر عهده خریدار است و آغاز یا اتمام دوره
                    تاثیری در تعهدات تقسیطی ایجادشده نزد کارگزار بانکی نخواهد
                    داشت.
                  </li>
                </ul>
              </div>
            </section>

            {/* ۴. شرایط پیش‌ثبت‌نام بیعانه برای کلاس‌ها */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  ۴
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  پیش‌ثبت‌نام با بیعانه (کارگاه‌های با ظرفیت محدود)
                </h2>
              </div>
              <div className="text-sm text-slate-600 leading-loose space-y-3">
                <p>
                  در برخی کارگاه‌های حضوری یا کلاس‌های آنلاین دارای محدودیت
                  ظرفیت، گزینه <strong>«پیش‌ثبت‌نام با بیعانه»</strong> فعال
                  است:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-slate-700">
                  <li>
                    پرداخت مبلغ بیعانه، صندلی دانشجو را تا موعد برگزاری رزرو
                    قطعی می‌کند.
                  </li>
                  <li>
                    مابقی شهریه دوره باید طبق جدول زمان‌بندی اعلام‌شده در صفحه
                    کلاس (معمولاً تا پیش از جلسه دوم دوره) از طریق پنل کاربری
                    تسویه شود. در صورت عدم تسویه، ادامه حضور در جلسات بعدی متوقف
                    خواهد شد.
                  </li>
                </ul>
              </div>
            </section>

            {/* ۵. شرایط انصراف از دوره و استرداد وجه (Refund Policy) */}
            <section className="space-y-4 bg-amber-50/50 p-5 sm:p-6 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3 border-b border-amber-300 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">
                  ۵
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-950">
                  قوانین انصراف، لغو ثبت‌نام و بازگشت وجه
                </h2>
              </div>
              <div className="text-sm text-amber-900 leading-loose space-y-3">
                <p className="font-semibold">
                  آکادمی تک یاد با هدف رعایت حقوق متقابل دانشجویان و اساتید،
                  مقررات شفاف زیر را برای انصراف اعمال می‌نماید:
                </p>
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-950 block mb-1">
                      الف) کلاس‌های آنلاین و کارگاه‌های زنده:
                    </span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      درخواست انصراف تا ۴۸ ساعت قبل از شروع اولین جلسه مشمول
                      بازگشت ۱۰۰٪ مبلغ پرداختی (یا کسر ۱۰٪ کارمزد اداری و بانکی)
                      خواهد بود. پس از برگزاری جلسه اول، درخواست انصراف تا پیش
                      از جلسه دوم با کسر هزینه جلسات برگزارشده و ۲۰٪ کارمزد
                      بررسی می‌شود. پس از آغاز جلسه دوم به دلیل بسته‌شدن ظرفیت،
                      امکان انصراف و بازگشت وجه وجود ندارد.
                    </p>
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-950 block mb-1">
                      ب) دوره‌های ویدئویی ضبط‌شده:
                    </span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      به دلیل تحویل آنی محتوای دیجیتال، انصراف تنها در صورتی
                      پذیرفته می‌شود که دانشجو کمتر از ۱۰٪ محتوای دوره را مشاهده
                      کرده باشد و حداکثر ظرف ۴۸ ساعت پس از خرید، عدم رضایت فنی
                      یا مغایرت سرفصل را از طریق تیکت پشتیبانی اعلام نماید.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ۶. نحوه عودت مبالغ پرداختی */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  ۶
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  نحوه عودت وجه
                </h2>
              </div>
              <div className="text-sm text-slate-600 leading-loose space-y-3">
                <p>
                  پس از تایید درخواست انصراف توسط کارشناسان پشتیبانی و واحد
                  مالی:
                </p>
                <ul className="list-disc list-inside space-y-2 pr-2 text-slate-700">
                  <li>
                    <strong>شارژ کیف پول (آنی):</strong> در صورت تمایل دانشجو،
                    مبلغ به صورت آنی به کیف پول آموزشی اضافه شده و بدون محدودیت
                    زمانی برای ثبت‌نام در دوره‌ها یا کلاس‌های دیگر قابل استفاده
                    است.
                  </li>
                  <li>
                    <strong>واریز بانکی:</strong> مبالغ نقدی ظرف مدت ۲۴ الی ۷۲
                    ساعت کاری صرفاً به شماره شبا متعلق به نام خریدار واریز
                    می‌گردد.
                  </li>
                  <li>
                    <strong>خریدهای اقساطی اسنپ‌پی:</strong> در صورت تایید
                    انصراف، فرایند لغو و عودت اقساط مستقیماً به پنل اسنپ‌پی
                    ارسال و بر اساس ضوابط مالی کارگزار تسویه می‌شود.
                  </li>
                </ul>
              </div>
            </section>

            {/* ۷. حق کپی‌رایت و مالکیت فکری */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  ۷
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  مالکیت فکری و حق تکثیر محتوا
                </h2>
              </div>
              <div className="text-sm text-slate-600 leading-loose space-y-2">
                <p>
                  تمامی ویدیوها، کدهای پروژه‌ها، اسلایدها و منابع آموزشی
                  ارائه‌شده در آکادمی تک یاد تحت حفاظت قانون حمایت از حقوق
                  پدیدآورندگان نرم‌افزارهای رایانه‌ای و قوانین مالکیت فکری قرار
                  دارند. هرگونه دانلود انبوه، انتشار عمومی در شبکه‌های اجتماعی،
                  فروش مجدد یا اشتراک تجاری پیگرد قانونی و قضایی فوری خواهد
                  داشت.
                </p>
              </div>
            </section>

            {/* ۸. تماس و ثبت درخواست پشتیبانی */}
            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <div className="font-bold text-slate-900 text-base">
                  نیاز به راهنمایی بیشتر یا ثبت درخواست انصراف دارید؟
                </div>
                <div className="text-xs text-slate-600">
                  تیم پشتیبانی آکادمی تک یاد در تمامی روزهای کاری همراه شماست.
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  ارسال تیکت پشتیبانی
                </Link>
                <a
                  href="tel:09372731037"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  <Phone className="w-4 h-4" />
                  تماس: ۰۹۳۷۲۷۳۱۰۳۷
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
