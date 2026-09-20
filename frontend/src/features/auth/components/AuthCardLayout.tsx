'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, GraduationCap, Users, ArrowRight } from 'lucide-react';

interface AuthCardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthCardLayout({ children, title, subtitle }: AuthCardLayoutProps) {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[var(--neo-bg)] relative overflow-hidden">
      {/* Background Decorative Pattern & Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="var(--neo-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>

      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--neo-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--neo-secondary)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-[var(--neo-border)] overflow-hidden relative z-10 grid lg:grid-cols-12 transition-all">
        
        {/* Visual Showcase Panel (Desktop lg: 5 cols) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-[#101828] to-slate-950 text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
          
          {/* Subtle glowing elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neo-primary)]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--neo-secondary)]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-9 h-9 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden bg-slate-900/80">
                <div className="w-2.5 h-2.5 bg-[var(--neo-secondary)] rounded-full"></div>
              </div>
              <span className="font-black text-2xl text-white tracking-tight group-hover:text-[var(--neo-primary)] transition">
                تک‌یاد
              </span>
            </Link>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-sky-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                آینده آموزشی خودت را بساز
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                یادگیری تخصصی با بالاترین استانداردهای آکادمیک و صنعتی
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal pt-1">
                دسترسی به جامع‌ترین مخزن دوره‌ها، کلاس‌های زنده تعاملی، آزمون‌های استاندارد و ارتباط مستقیم با اساتید.
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-3.5 my-8">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-[var(--neo-primary)]/30 text-sky-300 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">۳۵۰+ سرفصل تخصصی</div>
                <div className="text-slate-400">دروس دانشگاهی، مهندسی و هوش مصنوعی</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">گواهی معتبر مهارت</div>
                <div className="text-slate-400">قابلیت استعلام آنلاین و پیوست رزومه</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">+۱۲,۵۰۰ دانشجو فعال</div>
                <div className="text-slate-400">پشتیبانی و منتورینگ مرحله‌به‌مرحله</div>
              </div>
            </div>
          </div>

          {/* Bottom Student Testimonial */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-slate-300">
            «تک‌یاد به من کمک کرد تا هم‌زمان با معدل عالی دانشگاه، پروژه‌های صنعتی واقعی بسازم.»
          </div>

        </div>

        {/* Form Column (lg: 7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          {/* Top navigation link */}
          <div className="flex items-center justify-between pb-6 border-b border-[var(--neo-border)] mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </Link>

            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[var(--neo-primary)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[var(--neo-secondary)] rounded-full"></div>
              </div>
              <span className="font-bold text-base text-[var(--neo-text-main)]">تک‌یاد</span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-2 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-[var(--neo-text-secondary)]">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            {children}
          </div>

        </div>

      </div>
    </main>
  );
}
