'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Wallet } from 'lucide-react';

function MockGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams?.get('origin');
  const resNum = searchParams?.get('resNum') || searchParams?.get('authority') || '';
  const isWallet = origin === 'wallet' || origin === 'wallet_topup' || resNum.startsWith('WALLET');

  return (
    <main className="bg-[#f0f4f8] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full border border-gray-200 text-center space-y-5">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-black text-gray-900">اتصال مستقیم به درگاه بانکی سامان (سپ)</h2>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            تراکنش‌های خرید دوره و شارژ کیف پول مستقیماً از طریق سامانه شاپرک و درگاه امن سپ انجام می‌پذیرد.
          </p>
        </div>

        <div className="pt-2">
          {isWallet ? (
            <button
              onClick={() => router.push('/student/wallet')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>بازگشت به پنل کیف پول دانشجو</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>بازگشت به صفحه تسویه‌حساب</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">در حال بارگذاری...</div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
