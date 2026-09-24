'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Loader2, Wallet } from 'lucide-react';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authority = searchParams.get('authority');
  const type = searchParams.get('type'); // 'wallet' or empty
  const amount = searchParams.get('amount');
  const [isProcessing, setIsProcessing] = useState(false);

  const isWalletCharge = type === 'wallet' || (authority && authority.startsWith('WALLET_'));

  const handleCallback = async (status: 'OK' | 'NOK') => {
    if (!authority) return;
    setIsProcessing(true);

    try {
      if (isWalletCharge) {
        const res = await walletApi.verifyCharge(authority, status);
        if (res.data.success) {
          toast.success('کیف پول با موفقیت شارژ شد');
          router.push(`/student/wallet?charged=true&amount=${res.data.amount}`);
        } else {
          toast.error(res.data.message || 'عملیات شارژ لغو گردید');
          router.push('/student/wallet?charged=failed');
        }
      } else {
        const res = await commerceApi.verifyMockPayment(authority, status);
        if (res.data.success) {
          router.push(`/payment/success?orderId=${res.data.orderId}`);
        } else {
          router.push('/payment/failed');
        }
      }
    } catch (error: any) {
      if (isWalletCharge) {
        toast.error(error.response?.data?.message || 'خطا در تایید شارژ کیف پول');
        router.push('/student/wallet?charged=failed');
      } else {
        router.push('/payment/failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!authority) {
    return <div className="text-center p-8 text-red-500 font-bold">شناسه پرداخت نامعتبر است.</div>;
  }

  return (
    <main className="bg-[var(--neo-surface-2)] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-[var(--neo-border)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            {isWalletCharge ? <Wallet className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">
            {isWalletCharge ? 'درگاه شبیه‌ساز شارژ کیف پول' : 'درگاه پرداخت شبیه‌ساز شتاب'}
          </h1>
          {amount && (
            <div className="text-lg font-black text-emerald-600 mb-2">
              مبلغ: {Number(amount).toLocaleString('fa-IR')} تومان
            </div>
          )}
          <p className="text-sm font-mono text-[var(--neo-text-muted)] mb-4">شناسه: {authority}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            اتصال امن پروتکل شاپرک / زرین‌پال
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleCallback('OK')}
            disabled={isProcessing}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'شبیه‌سازی پرداخت موفق (OK)'}
          </button>
          
          <button 
            onClick={() => handleCallback('NOK')}
            disabled={isProcessing}
            className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'شبیه‌سازی انصراف / خطای بانکی (NOK)'}
          </button>
        </div>
        
        <p className="text-center text-xs text-[var(--neo-text-muted)] mt-8">
          این یک صفحه آزمایشی و شبیه‌ساز امن شاپرک برای سنجش فرآیند شارژ و تسویه است.
        </p>
      </div>
    </main>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-[var(--neo-secondary)] animate-spin" /></div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
