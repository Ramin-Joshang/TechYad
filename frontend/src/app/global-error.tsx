'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-right">
        <main className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="لوگو تک‌یاد" 
              className="h-12 w-auto object-contain rounded-xl"
            />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-slate-900">
              خطای سراسری در بارگذاری سامانه
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              متأسفانه خطایی در لایه اصلی برنامه رخ داده است. لطفاً صفحه را بارگذاری مجدد فرمایید.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>بارگذاری مجدد برنامه</span>
            </button>

            <a
              href="/"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
