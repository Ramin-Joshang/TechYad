"use client";

import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  Calendar,
  Award,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  FileText,
  ChevronLeft,
} from "lucide-react";

export function PurchaseGuideSection() {
  const steps = [
    {
      step: "۱",
      badge: "دسترسی آنی",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CreditCard,
      iconColor: "text-emerald-600",
      title: "خرید نقدی با تحویل فوری",
      description:
        "پرداخت امن از طریق درگاه رسمی شاپرک (سامان) یا کیف پول تک یاد. بلافاصله پس از تراکنش، دوره یا کلاس در پنل کاربری شما فعال و قابل استفاده است.",
      highlights: [
        "تسویه با کارت‌های عضو شبکه شتاب",
        "فعال‌سازی آنی محتوای ویدئویی و سرفصل‌ها",
        "امکان استفاده همزمان از کیف پول و درگاه",
      ],
    },
    {
      step: "۲",
      badge: "۰٪ کارمزد",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Sparkles,
      iconColor: "text-purple-600",
      title: "اقساط ۴ ماهه اسنپ‌پی",
      description:
        "پرداخت شهریه در ۴ قسط مساوی ماهانه بدون هیچ‌گونه سود، کارمزد اضافی یا نیاز به چک و سفته بانکی، با همکاری رسمی اسنپ‌پی.",
      highlights: [
        "پرداخت قسط اول (۲۵٪) در لحظه خرید",
        "۳ قسط ماهانه بعدی در ماه‌های آتی",
        "دسترسی کامل و آنی به دوره از همان قسط اول",
      ],
    },
    {
      step: "۳",
      badge: "رزرو صندلی",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Calendar,
      iconColor: "text-amber-600",
      title: "پیش‌ثبت‌نام بیعانه کارگاه‌ها",
      description:
        "برای کلاس‌های تعاملی آنلاین و کارگاه‌های حضوری با ظرفیت محدود، با پرداخت مبلغ بیعانه صندلی خود را قطعی رزرو نمایید.",
      highlights: [
        "تضمین جایگاه در کلاس‌های محدود",
        "تسویه مابقی شهریه تا پیش از جلسه دوم",
        "هماهنگی مستقیم پشتیبانی جهت ورود به جلسات",
      ],
    },
    {
      step: "۴",
      badge: "گواهی معتبر",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Award,
      iconColor: "text-blue-600",
      title: "پنل کاربری و دریافت مدرک",
      description:
        "محیط آموزشی اختصاصی با دسترسی همیشگی به بازپخش جلسات، لینک کلاس‌های آنلاین زنده، فایل‌های تمرینی و صدور گواهی پایان دوره.",
      highlights: [
        "دسترسی مادام‌العمر به ویدیوهای ضبط‌شده",
        "ارتباط و پرسش و پاسخ با اساتید در پنل",
        "صدور گواهینامه معتبر با کد پیگیری آنلاین",
      ],
    },
  ];

  return (
    <section
      className="py-14 sm:py-20 bg-white border-b border-[var(--neo-border)] relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
            <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase">
              مسیر شفاف یادگیری
            </span>
            <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--neo-text-main)] mb-4">
            نحوه خرید و شرایط پرداخت در آکادمی تک یاد
          </h2>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed">
            ما مسیر ثبت‌نام و یادگیری را ساده، شفاف و منعطف طراحی کرده‌ایم تا
            بدون دغدغه مالی مهارت‌های آینده‌ساز را بیاموزید.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--neo-bg)] rounded-3xl p-6 border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 space-y-2">
                  {item.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 text-[11px] text-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Banner & Terms Link */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>پشتیبانی و تضمین شفافیت قرارداد</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold">
              تمامی پرداخت‌ها و شرایط انصراف تحت پوشش قوانین رسمی آکادمی تک یاد
              است
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              برای مطالعه جدول زمان‌بندی انصراف از کلاس‌ها، استرداد وجه به شماره
              شبا یا کیف پول، و تعهدات خرید اقساطی اسنپ‌پی، صفحه قوانین را بررسی
              فرمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm transition shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>مطالعه قوانین، شرایط خرید و انصراف</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold text-xs sm:text-sm transition shadow-sm"
            >
              <span>مشاهده کلاس‌های فعال</span>
              <span>←</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
