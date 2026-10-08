'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, RefreshCw, Home, ArrowRight, 
  HelpCircle, ShieldAlert 
} from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log client/server error to console in dev mode
    console.error('App runtime error caught by error boundary:', error);
  }, [error]);

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--neo-bg)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-right relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-xl w-full text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 transition">
            <img 
              src="/logo.png" 
              alt="لوگو تک‌یاد" 
              className="h-12 w-auto max-w-[160px] object-contain drop-shadow-sm rounded-xl"
            />
            <span className="font-black text-2xl text-[var(--neo-text-main)] tracking-tight">
              تک‌یاد
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>خطای ۵۰۰ | اختلال در ارتباط یا سرور</span>
          </div>
        </div>

        {/* 500 Graphic Icon */}
        <div className="relative py-4 select-none">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-rose-100 to-transparent">
            500
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-rose-200 shadow-xl flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)]">
            متأسفانه مشکلی در پردازش پیش آمد
          </h1>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed max-w-md mx-auto font-normal">
            ارتباط با سرور با اختلال مواجه شد یا خطای غیرمنتظره‌ای رخ داد. این وضعیت موقتی است و تیم فنی در جریان رفع آن می‌باشد.
          </p>
          {error?.digest && (
            <div className="text-[11px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-lg inline-block dir-ltr">
              کد پیگیری خطا: {error.digest}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button 
            type="button"
            onClick={() => reset()} 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--neo-primary)] hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-[var(--neo-primary)]/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تلاش مجدد</span>
          </button>

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
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[var(--neo-text-main)] border border-[var(--neo-border)] text-sm font-bold shadow-xs hover:border-slate-300 transition-all"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>صفحه اصلی</span>
          </Link>
        </div>

        {/* Support Help Footer */}
        <div className="pt-4 border-t border-[var(--neo-border)]/80 flex items-center justify-center gap-4 text-xs font-medium text-[var(--neo-text-muted)]">
          <Link href="/contact" className="hover:text-[var(--neo-primary)] transition flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>تماس با پشتیبانی و گزارش اشکال</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
