'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GitFork, ArrowRight, Home, BookOpen, 
  GraduationCap, Search, LayoutGrid, Compass,
  Layers, ArrowUpLeft
} from 'lucide-react';

export default function MultipleChoices300Page() {
  const router = useRouter();

  return (
    <div dir="rtl" className="min-h-[85vh] bg-[var(--neo-bg)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-right relative overflow-hidden select-none">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-xl w-full text-center relative z-10 space-y-7 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo & Status Badge */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 p-2 rounded-2xl hover:bg-white/60 transition group">
            <img 
              src="/logo.png" 
              alt="لوگو تک‌یاد" 
              className="h-12 w-auto max-w-[160px] object-contain drop-shadow-sm rounded-xl group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-2xl text-[var(--neo-text-main)] tracking-tight">
              تک‌یاد
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>وضعیت ۳۰۰ | مقاصد چندگانه و انتقال نشانی (Multiple Choices)</span>
          </div>
        </div>

        {/* 300 Large Artistic Display */}
        <div className="relative py-2 select-none">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent">
            300
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-indigo-200 shadow-xl flex items-center justify-center text-indigo-600">
              <GitFork className="w-10 h-10 animate-pulse text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Informative Content */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)]">
            برای این نشانی چندین مقصد وجود دارد
          </h1>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed max-w-md mx-auto font-normal">
            منبع، دوره یا درسی که درخواست کرده‌اید جابه‌جا شده یا شامل چند مسیر مجاز است. لطفاً بخش مورد نظر خود را از گزینه‌های زیر انتخاب نمایید.
          </p>
        </div>

        {/* Multiple Choice Cards */}
        <div className="grid sm:grid-cols-2 gap-3 text-right">
          <Link
            href="/courses"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-indigo-50/50 border border-[var(--neo-border)] hover:border-indigo-300 rounded-2xl shadow-2xs transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-blue-600">کاتالوگ دوره‌ها</div>
                <div className="text-[11px] text-[var(--neo-text-muted)]">دوره‌های ویدئویی و پروژه‌محور</div>
              </div>
            </div>
            <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link
            href="/classes"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-emerald-50/50 border border-[var(--neo-border)] hover:border-emerald-300 rounded-2xl shadow-2xs transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-emerald-600">کلاس‌های آنلاین</div>
                <div className="text-[11px] text-[var(--neo-text-muted)]">کلاس‌های زنده و وبینارهای تخصصی</div>
              </div>
            </div>
            <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <Link
            href="/categories"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-purple-50/50 border border-[var(--neo-border)] hover:border-purple-300 rounded-2xl shadow-2xs transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-purple-600">دسته‌بندی‌های تخصصی</div>
                <div className="text-[11px] text-[var(--neo-text-muted)]">ریاضیات، کامپیوتر، برق و مهندسی</div>
              </div>
            </div>
            <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </Link>

          <Link
            href="/search"
            className="flex items-center justify-between p-3.5 bg-white hover:bg-sky-50/50 border border-[var(--neo-border)] hover:border-sky-300 rounded-2xl shadow-2xs transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-sky-600">جستجوی هوشمند</div>
                <div className="text-[11px] text-[var(--neo-text-muted)]">یافتن مدرس، درس یا سرفصل دلخواه</div>
              </div>
            </div>
            <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </Link>
        </div>

        {/* Action Buttons */}
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
      </main>
    </div>
  );
}
