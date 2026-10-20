"use client";

import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  FileText,
  ChevronLeft,
} from "lucide-react";

export function PurchaseGuideSection() {
  const steps = [
    {
      step: "۱",
      badge: "تخفیف ویژه نقدی",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CreditCard,
      iconColor: "text-emerald-600",
      title: "خرید نقدی (تخفیف ویژه و چشمگیر)",
      description:
        "در صورت پرداخت نقدی، شهریه دوره یا کلاس شامل تخفیف بسیار خوب و قابل توجهی نسبت به قیمت اقساطی می‌شود. پرداخت سریع و امن از طریق کلیه کارت‌های شتاب یا کیف پول با دسترسی آنی به محتوا.",
      highlights: [
        "بهره‌مندی از بیشترین درصد تخفیف خرید نقدی",
        "تسویه آنی با کلیه کارت‌های عضو شتاب یا موجودی کیف پول",
        "فعال‌سازی لحظه‌ای محتوا، بازپخش‌ها و فایل‌های آموزشی",
      ],
    },
    {
      step: "۲",
      badge: "۰٪ کارمزد و سود",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Sparkles,
      iconColor: "text-purple-600",
      title: "اقساط ۴ ماهه اسنپ‌پی",
      description:
        "پرداخت شهریه در ۴ قسط مساوی ماهانه بدون هیچ‌گونه سود، کارمزد اضافی یا نیاز به ارائه چک و ضامن بانکی. تنها با پرداخت قسط اول (۲۵٪) دسترسی شما به آموزش بلافاصله فعال می‌شود.",
      highlights: [
        "پرداخت قسط اول (۲۵٪) در لحظه ثبت‌نام و تسویه آسان",
        "سه قسط مساوی در ماه‌های آتی بدون کارمزد بانکی",
        "دسترسی نامحدود و آنی به کلاس از همان قسط نخست",
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
        "ویژه کلاس‌های تعاملی آنلاین و کارگاه‌های حضوری با ظرفیت محدود؛ با پرداخت تنها بخشی از شهریه به عنوان بیعانه، صندلی خود را قطعی رزرو کرده و مابقی را طبق جدول پرداخت تسویه نمایید.",
      highlights: [
        "تضمین قطعی جایگاه در دوره‌های با ظرفیت محدود",
        "امکان تسویه مابقی شهریه تا پیش از جلسه دوم",
        "هماهنگی اختصاصی تیم پشتیبانی جهت ورود به جلسات",
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
              مسیر شفاف و مطمئن یادگیری
            </span>
            <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--neo-text-main)] mb-4">
            روش‌های پرداخت و ثبت‌نام در آکادمی تک یاد
          </h2>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed">
            ما مسیر ثبت‌نام و یادگیری را ساده، شفاف و منعطف طراحی کرده‌ایم؛ در صورت پرداخت نقدی از تخفیف بسیار خوب و قابل توجهی بهره‌مند می‌شوید و همچنین برای راحتی بیشتر امکان تقسیط ۴ ماهه اسنپ‌پی بدون کارمزد فراهم است.
          </p>
        </div>

        {/* 3 Payment Methods Grid with equal heights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-stretch">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--neo-bg)] rounded-3xl p-6 border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full group"
              >
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2 min-h-[30px] flex items-center">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6 flex-grow min-h-[72px]">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 space-y-2.5 mt-auto">
                  {item.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Banner & Terms Link - Harmonized with site theme */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-[var(--neo-border)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--neo-primary)] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>پشتیبانی و تضمین شفافیت قرارداد</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-[var(--neo-text-main)]">
              تمامی پرداخت‌ها و شرایط انصراف تحت پوشش قوانین رسمی آکادمی تک یاد است
            </h4>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] leading-relaxed max-w-2xl">
              برای مطالعه جدول زمان‌بندی انصراف از کلاس‌ها، استرداد وجه به شماره شبا یا کیف پول، و تعهدات خرید اقساطی اسنپ‌پی، صفحه قوانین را بررسی فرمایید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/terms"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-800 hover:text-[var(--neo-primary)] hover:border-[var(--neo-primary)] border border-[var(--neo-border)] font-bold text-xs sm:text-sm transition shadow-2xs"
            >
              <FileText className="w-4 h-4 text-[var(--neo-primary)]" />
              <span>مطالعه قوانین و شرایط انصراف</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--neo-primary)] text-white hover:bg-[var(--neo-primary-hover)] font-bold text-xs sm:text-sm transition shadow-xs"
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
