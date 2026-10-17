"use client";

import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Wallet,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";

export function SnappPayBanner() {
  return (
    <section className="py-8 sm:py-12 bg-[var(--neo-bg)] border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          dir="rtl"
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl p-6 sm:p-10 md:p-12 border border-indigo-900/60"
        >
          {/* Subtle ambient lighting decorations */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Right Side: Introduction & Value Proposition */}
            <div className="flex-1 text-right w-full">
              {/* Promotional Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span>فرصت ویژه یادگیری در تک یاد</span>
                <span className="text-cyan-600">|</span>
                <span className="font-normal text-cyan-200">
                  با همکاری اسنپ‌پی و سرویس‌های اعتباری
                </span>
              </div>

              {/* Catchy Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight sm:leading-snug mb-3.5 text-white">
                امکان{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-blue-300 to-indigo-200">
                  خرید اقساطی دوره‌ها
                </span>
                ؛
                <br className="hidden sm:inline" /> یادگیری امروز، پرداخت منعطف
                و آسان
              </h2>

              {/* Concise descriptive copy */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl font-light">
                دسترسی به آموزش‌های تخصصی و ورود به بازار کار نباید معطل
                محدودیت‌های مالی بماند. با راهکار پرداخت اقساطی تک یاد،
                می‌توانید بدون دغدغه در دوره‌ها و کلاس‌های مورد علاقه‌تان
                ثبت‌نام کنید و هزینه آن را در بازه‌های زمانی راحت بپردازید.
              </p>

              {/* Advantage Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      دسترسی آنی به آموزش
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      شروع سریع یادگیری بدون وقفه
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-400/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      بدون چک و ضامن پیچیده
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ثبت‌نام آنلاین و بدون مدارک سنتی
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      مدیریت آسان هزینه‌ها
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      تقسیم شهریه در بازه‌های منظم
                    </div>
                  </div>
                </div>
              </div>

              {/* Call To Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/courses"
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-slate-950" />
                  <span>مشاهده و انتخاب دوره‌ها</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Link>

                <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    امکان پرداخت از درگاه‌های معتبر شتاب و به‌زودی سرویس اقساطی
                    اسنپ‌پی
                  </span>
                </div>
              </div>
            </div>

            {/* Left Side: Modern Promotional Visual Card */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">
                        خرید اقساطی هوشمند
                      </div>
                      <div className="text-[11px] text-cyan-300">
                        سرمایه‌گذاری روی مهارت و تخصص
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    BNPL
                  </span>
                </div>

                <div className="space-y-3.5 mb-6 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      انتخاب هر دوره، کارگاه یا کلاس زنده مورد نظرتان در سایت
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      بهره‌مندی از پرداخت قسطی بدون نیاز به پرداخت یکجای شهریه
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      شروع مستقیم مسیر یادگیری همراه با پشتیبانی اساتید
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-center">
                  <div className="text-[11px] text-slate-400 mb-1">
                    همکاری برای آموزش دسترس‌پذیر برای همه
                  </div>
                  <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>فرصت یادگیری بدون مرز مالی در تک یاد</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
