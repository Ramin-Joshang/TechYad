'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, 
  Zap, Percent, Wallet
} from 'lucide-react';

const PRESET_AMOUNTS = [
  { label: 'دوره عمومی', amount: 1200000 },
  { label: 'دوره جامع تخصصی', amount: 2400000 },
  { label: 'بوت‌کمپ و کلاس زنده', amount: 3600000 },
];

export function SnappPayBanner() {
  const [selectedAmount, setSelectedAmount] = useState<number>(2400000);

  const installmentAmount = Math.round(selectedAmount / 4);

  const formatPrice = (val: number) => {
    return val.toLocaleString('fa-IR');
  };

  return (
    <section className="py-8 sm:py-12 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          dir="rtl"
          className="relative overflow-hidden rounded-3xl bg-white border-2 border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all duration-300 p-6 sm:p-8 md:p-10"
        >
          {/* Subtle themed ambient gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--neo-primary)]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Right Side (Content & Benefits) */}
            <div className="flex-1 text-right w-full">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-cyan-700 font-black">اسنپ‌پی | SnappPay</span>
                <span className="text-gray-300">|</span>
                <span className="text-cyan-800 font-medium">پرداخت در ۴ قسط مساوی</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)] leading-snug mb-2.5">
                یادگیری امروز، <span className="text-[var(--neo-primary)]">پرداخت در ۴ قسط</span> بدون کارمزد!
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] leading-relaxed mb-5 max-w-xl">
                با اعتبار اسنپ‌پی، هزینه دوره‌ها و کلاس‌های تک‌یاد را بدون چک، بدون ضامن و بدون سود در ۴ قسط ماهانه بپردازید و یادگیری را همین لحظه با پرداخت فقط ۲۵٪ مبلغ شروع کنید.
              </p>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mb-6 text-xs font-bold text-[var(--neo-text-main)]">
                <div className="flex items-center gap-1.5 bg-[var(--neo-surface-2)] px-3 py-1.5 rounded-xl border border-[var(--neo-border)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>۰٪ کارمزد و سود اضافه</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--neo-surface-2)] px-3 py-1.5 rounded-xl border border-[var(--neo-border)]">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>بدون چک، سفته و ضامن</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--neo-surface-2)] px-3 py-1.5 rounded-xl border border-[var(--neo-border)]">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>دسترسی آنی به کل دوره</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <Link
                  href="/courses"
                  className="px-5 py-2.5 rounded-xl bg-[var(--neo-primary)] hover:bg-[#5a3ae6] text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <span>مشاهده دوره‌ها و خرید اقساطی</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <span className="text-[11px] text-[var(--neo-text-muted)] font-medium">
                  انتخاب درگاه اسنپ‌پی در مرحله پرداخت
                </span>
              </div>
            </div>

            {/* Left Side (Compact Interactive Mini-Calculator) */}
            <div className="w-full lg:w-[420px] bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl p-5 sm:p-6 text-right shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white text-[var(--neo-primary)] flex items-center justify-center border border-[var(--neo-border)] shadow-2xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--neo-text-main)]">
                      محاسبه‌گر سریع اقساط
                    </h3>
                    <p className="text-[10px] text-[var(--neo-text-muted)]">مبلغ نمونه را انتخاب کنید</p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  سود: ۰ تومان
                </div>
              </div>

              {/* Preset Selectors */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PRESET_AMOUNTS.map((p) => (
                  <button
                    key={p.amount}
                    type="button"
                    onClick={() => setSelectedAmount(p.amount)}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                      selectedAmount === p.amount
                        ? 'bg-white text-[var(--neo-primary)] border-[var(--neo-primary)] shadow-xs'
                        : 'bg-white/60 text-[var(--neo-text-secondary)] border-transparent hover:bg-white'
                    }`}
                  >
                    <div className="text-[10px] text-gray-500 font-normal">{p.label}</div>
                    <div className="font-mono mt-0.5">{formatPrice(p.amount / 1000)}ک ت</div>
                  </button>
                ))}
              </div>

              {/* Result Highlight */}
              <div className="bg-white p-3.5 rounded-xl border border-[var(--neo-border)] mb-4 text-center">
                <div className="text-[11px] text-[var(--neo-text-secondary)] mb-1">
                  مبلغ هر قسط ماهانه (۴ قسط مساوی):
                </div>
                <div className="text-xl sm:text-2xl font-black text-[var(--neo-primary)] font-mono">
                  {formatPrice(installmentAmount)} <span className="text-xs font-normal text-gray-500">تومان</span>
                </div>
              </div>

              {/* 4 Steps timeline pills */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200">
                  <div className="text-[9px] font-bold text-cyan-800">امروز</div>
                  <div className="text-[10px] font-black text-cyan-900 mt-0.5">قسط ۱ (۲۵٪)</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[var(--neo-border)]">
                  <div className="text-[9px] text-gray-500">ماه ۱</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-0.5">قسط ۲</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[var(--neo-border)]">
                  <div className="text-[9px] text-gray-500">ماه ۲</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-0.5">قسط ۳</div>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[var(--neo-border)]">
                  <div className="text-[9px] text-gray-500">ماه ۳</div>
                  <div className="text-[10px] font-bold text-gray-700 mt-0.5">قسط ۴</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
