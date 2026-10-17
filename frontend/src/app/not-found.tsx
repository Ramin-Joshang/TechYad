"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ArrowRight,
  BookOpen,
  GraduationCap,
  HelpCircle,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[var(--neo-bg)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-right relative overflow-hidden select-none"
    >
      {/* Background decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-xl w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 transition"
          >
            <img
              src="/logo.png"
              alt="لوگو تک یاد"
              className="h-12 w-auto max-w-[160px] object-contain drop-shadow-sm rounded-xl"
            />
            <span className="font-black text-2xl text-[var(--neo-text-main)] tracking-tight">
              تک یاد
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>خطای ۴۰۴ | صفحه مورد نظر یافت نشد</span>
          </div>
        </div>

        {/* 404 Large Artistic Typography */}
        <div className="relative py-4 select-none">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-300 via-slate-200 to-transparent">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-[var(--neo-border)] shadow-xl flex items-center justify-center text-[var(--neo-primary)]">
              <Compass className="w-10 h-10 animate-pulse text-[var(--neo-primary)]" />
            </div>
          </div>
        </div>

        {/* Informative Text */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)]">
            مسیر مورد نظر پیدا نشد!
          </h1>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed max-w-md mx-auto font-normal">
            آدرسی که وارد کرده‌اید اشتباه است یا این صفحه حذف یا جابه‌جا شده
            است. نگران نباشید، با دکمه‌های زیر می‌توانید به بخش‌های اصلی دسترسی
            داشته باشید.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[var(--neo-text-main)] border border-[var(--neo-border)] text-sm font-bold shadow-xs hover:border-slate-300 transition-all cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span>بازگشت به صفحه قبل</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--neo-primary)] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-[var(--neo-primary)]/20 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>صفحه اصلی سایت</span>
          </Link>
        </div>

        {/* Quick Discovery Cards */}
        <div className="pt-4 border-t border-[var(--neo-border)]/80">
          <div className="text-xs font-bold text-[var(--neo-text-muted)] mb-3 text-center">
            شاید این بخش‌ها برای شما مفید باشد:
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/courses"
              className="p-3 bg-white hover:bg-blue-50/50 border border-[var(--neo-border)] hover:border-blue-200 rounded-2xl transition group text-center"
            >
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[var(--neo-text-main)] block">
                دوره‌ها
              </span>
            </Link>

            <Link
              href="/classes"
              className="p-3 bg-white hover:bg-emerald-50/50 border border-[var(--neo-border)] hover:border-emerald-200 rounded-2xl transition group text-center"
            >
              <GraduationCap className="w-5 h-5 mx-auto mb-1 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[var(--neo-text-main)] block">
                کلاس‌ها
              </span>
            </Link>

            <Link
              href="/contact"
              className="p-3 bg-white hover:bg-purple-50/50 border border-[var(--neo-border)] hover:border-purple-200 rounded-2xl transition group text-center"
            >
              <HelpCircle className="w-5 h-5 mx-auto mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[var(--neo-text-main)] block">
                پشتیبانی
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
