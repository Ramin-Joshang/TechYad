'use client';

import { XCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] p-8 sm:p-12 text-center">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-black text-[var(--neo-text-main)] mb-2">پرداخت ناموفق بود</h1>
        <p className="text-[var(--neo-text-muted)] mb-8 leading-relaxed">
          متاسفانه در فرآیند پرداخت مشکلی به وجود آمد و مبلغی از حساب شما کسر نشد. 
          در صورت کسر وجه، مبلغ تا ۷۲ ساعت آینده به حساب شما بازخواهد گشت.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link href="/checkout" className="w-full bg-[var(--neo-primary)] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-[var(--neo-primary)]/20">
            <RefreshCcw className="w-5 h-5" />
            تلاش مجدد برای پرداخت
          </Link>
          <Link href="/cart" className="w-full bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] px-6 py-4 rounded-xl font-bold hover:bg-[var(--neo-border)] transition flex items-center justify-center gap-2">
            بازگشت به سبد خرید
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
