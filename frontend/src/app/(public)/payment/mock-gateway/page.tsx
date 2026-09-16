'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { commerceApi } from '@/features/commerce/api/commerce.api';

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authority = searchParams.get('authority');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCallback = async (status: 'OK' | 'NOK') => {
    if (!authority) return;
    setIsProcessing(true);
    try {
      const res = await commerceApi.verifyMockPayment(authority, status);
      if (res.data.success) {
        router.push(`/payment/success?orderId=${res.data.orderId}`);
      } else {
        router.push('/payment/failed');
      }
    } catch (error) {
      router.push('/payment/failed');
    }
  };

  if (!authority) {
    return <div className="text-center p-8 text-red-500 font-bold">شناسه پرداخت نامعتبر است.</div>;
  }

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">درگاه پرداخت شبیه‌ساز</h1>
          <p className="text-sm text-gray-500 mb-4">شناسه تراکنش: {authority}</p>
          <div className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            اتصال امن به درگاه بانکی
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleCallback('OK')}
            disabled={isProcessing}
            className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'شبیه‌سازی پرداخت موفق (OK)'}
          </button>
          
          <button 
            onClick={() => handleCallback('NOK')}
            disabled={isProcessing}
            className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'شبیه‌سازی انصراف/خطا (NOK)'}
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          این یک صفحه شبیه‌سازی برای تست مراحل خرید در پروژه می‌باشد.
        </p>
      </div>
    </main>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-500 animate-spin" /></div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
