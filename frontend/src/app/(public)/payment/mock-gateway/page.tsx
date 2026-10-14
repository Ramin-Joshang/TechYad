'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Loader2, Wallet, Building2, CheckCircle2, Lock } from 'lucide-react';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const authority = searchParams.get('authority');
  const type = searchParams.get('type'); // 'wallet' or empty
  const amount = searchParams.get('amount');
  const walletApplied = searchParams.get('walletApplied');
  const gateway = searchParams.get('gateway') || 'saman';
  const terminalId = searchParams.get('terminalId') || '15859910';
  const [isProcessing, setIsProcessing] = useState(false);

  const isWalletCharge = type === 'wallet' || (authority && authority.startsWith('WALLET_'));
  const isSaman = gateway.includes('saman') || terminalId === '15859910';

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

  const amountNumber = Number(amount) || 0;
  const amountRials = amountNumber * 10;

  return (
    <main className="bg-[#f0f4f8] min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl max-w-lg w-full border border-gray-200">
        
        {/* Header with Saman / Shaparak Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shadow-blue-700/20">
              SEP
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">پرداخت الکترونیک سامان (سپ)</h2>
              <p className="text-[11px] text-gray-500">درگاه پرداخت اینترنتی شاپرک بانک سامان</p>
            </div>
          </div>
          <div className="text-left font-mono text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <Lock className="w-3 h-3" />
              SSL 256-bit
            </span>
          </div>
        </div>

        {/* Merchant & Terminal Info */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">پذیرنده اینترنتی:</span>
            <span className="font-bold text-gray-900">آکادمی تک‌یاد (TechYad)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">شماره ترمینال (Terminal ID):</span>
            <span className="font-mono font-black text-blue-700 text-sm px-2 py-0.5 bg-blue-100/70 rounded-md">
              {terminalId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">شناسه خرید / ارجاع:</span>
            <span className="font-mono text-gray-700 text-[11px] max-w-[200px] truncate" title={authority}>
              {authority}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-2.5">
            <span className="text-gray-600 font-bold">مبلغ قابل پرداخت:</span>
            <div className="text-left">
              <div className="font-black text-emerald-600 text-base">
                {amountNumber.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono">
                ({amountRials.toLocaleString('fa-IR')} ریال)
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Hybrid Deduction Info */}
        {walletApplied && Number(walletApplied) > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-900 mb-6 text-right">
            <div className="flex justify-between items-center font-bold">
              <span>کسر از موجودی کیف پول تک‌یاد:</span>
              <span className="text-indigo-700">-{Number(walletApplied).toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="text-[11px] text-indigo-600 mt-1">
              مابقی مبلغ سفارش از طریق درگاه پرداخت الکترونیک سامان تسویه می‌گردد.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => handleCallback('OK')}
            disabled={isProcessing}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-700/25 cursor-pointer disabled:opacity-60 text-sm"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                تایید پرداخت بانکی درگاه سامان (موفق)
              </>
            )}
          </button>
          
          <button 
            onClick={() => handleCallback('NOK')}
            disabled={isProcessing}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'انصراف از پرداخت / بازگشت به سایت'}
          </button>
        </div>
        
        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-6 pt-4 border-t border-gray-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>پروتکل شاپرک سامانه پرداخت الکترونیک بانک سامان</span>
        </div>
      </div>
    </main>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
