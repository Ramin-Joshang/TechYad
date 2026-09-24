'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, CreditCard, ArrowRight, Loader2, Tag, 
  Wallet, CheckCircle2, AlertCircle, PlusCircle, Sparkles, Check
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // Hybrid Wallet State: user can choose to apply available wallet balance
  const [applyWalletBalance, setApplyWalletBalance] = useState(true);

  // Optional Quick Charge Modal
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [customChargeAmount, setCustomChargeAmount] = useState<number>(100000);
  const [isCharging, setIsCharging] = useState(false);

  // Fetch standard cart preview
  const { data: baseData, isLoading: isBaseLoading } = useQuery({
    queryKey: ['checkoutPreviewBase'],
    queryFn: () => commerceApi.checkoutPreview().then(res => res.data),
    enabled: isAuthenticated && !isInitializing,
    retry: false,
  });

  // Fetch live wallet balance
  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['myWalletOverview'],
    queryFn: () => walletApi.getOverview().then(res => res.data),
    enabled: isAuthenticated && !isInitializing,
  });

  // Preview data state that holds either base or coupon-applied preview
  const [previewData, setPreviewData] = useState<any>(null);

  // Synchronize base preview when loaded and no coupon is active
  const effectivePreview = previewData || baseData;
  const currentWalletBalance = walletData?.balance ?? effectivePreview?.walletBalance ?? user?.walletBalance ?? 0;
  const totalAmount = effectivePreview?.totalAmount ?? 0;

  // Calculation of Hybrid Payment:
  const walletDeduction = (applyWalletBalance && currentWalletBalance > 0) 
    ? Math.min(currentWalletBalance, totalAmount) 
    : 0;
  const remainingToPay = Math.max(0, totalAmount - walletDeduction);
  const isFullWalletPayment = walletDeduction === totalAmount && totalAmount > 0;
  const isHybridPayment = walletDeduction > 0 && remainingToPay > 0;

  // Handle Coupon Submit
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim();
    if (!cleanCode) return;

    setIsApplyingCoupon(true);
    try {
      const res = await commerceApi.checkoutPreview(cleanCode);
      if (res.data) {
        setPreviewData(res.data);
        setAppliedCoupon(cleanCode);
        toast.success(`کد تخفیف ${cleanCode} با موفقیت اعمال شد`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'کد تخفیف نامعتبر یا منقضی شده است';
      toast.error(msg);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon('');
    setCouponCode('');
    setPreviewData(null);
    toast.success('کد تخفیف حذف شد');
  };

  // Payment with Gateway (Supports pure gateway OR hybrid gateway)
  const gatewayMutation = useMutation({
    mutationFn: async ({ useWallet }: { useWallet: boolean }) => {
      const orderRes = await commerceApi.createOrder(appliedCoupon, useWallet);
      const orderId = orderRes.data._id;
      const paymentRes = await commerceApi.createMockPayment(orderId);
      return paymentRes.data;
    },
    onSuccess: (data) => {
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ایجاد تراکنش بانکی');
    }
  });

  // 100% Payment with Wallet
  const walletPaymentMutation = useMutation({
    mutationFn: async () => {
      const orderRes = await commerceApi.createOrder(appliedCoupon, true);
      const orderId = orderRes.data._id;
      const walletRes = await walletApi.payOrderWithWallet(orderId);
      return { ...walletRes.data, orderId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myWalletOverview'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('سفارش شما با موفقیت از طریق کیف پول پرداخت شد!');
      router.push(`/payment/success?orderId=${data.orderId}&method=wallet`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در پرداخت با کیف پول');
    }
  });

  const handleFinalPayment = () => {
    if (!acceptedTerms) {
      toast.error('لطفاً قوانین و مقررات را بپذیرید');
      return;
    }

    if (isFullWalletPayment) {
      walletPaymentMutation.mutate();
    } else {
      gatewayMutation.mutate({ useWallet: applyWalletBalance && walletDeduction > 0 });
    }
  };

  // Quick Charge Handler (Optional convenience for user)
  const handleQuickCharge = async (amount: number) => {
    setIsCharging(true);
    try {
      const res = await walletApi.chargeWallet(amount);
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در اتصال به درگاه شارژ کیف پول');
    } finally {
      setIsCharging(false);
    }
  };

  if (isInitializing || isBaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neo-bg)]">
        <Loader2 className="w-12 h-12 text-[var(--neo-secondary)] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--neo-bg)] p-4">
        <h2 className="text-2xl font-bold mb-4">لطفاً وارد حساب کاربری خود شوید</h2>
        <button onClick={() => router.push('/login?redirect=/checkout')} className="bg-[var(--neo-primary)] text-white px-6 py-2 rounded-xl">
          ورود به حساب
        </button>
      </div>
    );
  }

  const items = effectivePreview?.items || [];
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--neo-bg)] p-4">
        <h2 className="text-2xl font-bold mb-4">سبد خرید شما خالی است</h2>
        <button onClick={() => router.push('/cart')} className="bg-[var(--neo-primary)] text-white px-6 py-2 rounded-xl">
          بازگشت به سبد خرید
        </button>
      </div>
    );
  }

  const isProcessingPayment = walletPaymentMutation.isPending || gatewayMutation.isPending;

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] mb-8 transition">
          <ArrowRight className="w-5 h-5" />
          بازگشت به سبد خرید
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Right Column - User Info, Items & Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: User Info */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۱</div>
                اطلاعات خریدار
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1">نام و نام خانوادگی</label>
                  <div className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 text-[var(--neo-text-main)] font-semibold">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1">ایمیل</label>
                  <div className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 text-[var(--neo-text-muted)] text-left font-mono text-sm">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Order Items */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۲</div>
                آیتم‌های سفارش ({items.length} مورد)
              </h2>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.itemId} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-4">
                      <img src={item.thumbnail || `https://picsum.photos/seed/${item.itemId}/100/100`} alt={item.titleSnapshot} className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                      <div>
                        <div className="text-xs text-[var(--neo-primary)] font-bold mb-1">{item.itemType === 'course' ? 'دوره آموزشی' : 'کلاس زنده'}</div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">{item.titleSnapshot}</h4>
                      </div>
                    </div>
                    <div className="font-black text-[var(--neo-text-main)] text-base">
                      {item.finalPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal text-[var(--neo-text-muted)]">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method & Wallet Hybrid Option */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۳</div>
                روش پرداخت و استفاده از اعتبار کیف پول
              </h2>

              {/* Wallet Usage Box */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${
                applyWalletBalance && currentWalletBalance > 0
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                  : 'border-slate-200 bg-slate-50/50'
              }`}>
                <div className="flex items-start justify-between">
                  <label className="flex items-start gap-3.5 cursor-pointer select-none flex-1">
                    <input
                      type="checkbox"
                      disabled={currentWalletBalance === 0}
                      checked={applyWalletBalance && currentWalletBalance > 0}
                      onChange={(e) => setApplyWalletBalance(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-40"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                        استفاده از موجودی کیف پول تک‌یاد
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          currentWalletBalance > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          موجودی: {currentWalletBalance.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {currentWalletBalance === 0 ? (
                          'موجودی کیف پول شما صفر است. کل مبلغ از طریق درگاه پرداخت خواهد شد.'
                        ) : isFullWalletPayment ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                            موجودی کیف پول شما برای پرداخت کامل سفارش کافی است (بدون نیاز به اتصال به درگاه بانکی).
                          </span>
                        ) : (
                          <span className="text-indigo-900 font-medium">
                            کل موجودی کیف پول شما به مبلغ <strong className="text-indigo-700">{currentWalletBalance.toLocaleString('fa-IR')} تومان</strong> کسر خواهد شد و تنها مبلغ باقیمانده (<strong className="text-indigo-700">{remainingToPay.toLocaleString('fa-IR')} تومان</strong>) به درگاه پرداخت شتاب منتقل می‌شود.
                          </span>
                        )}
                      </p>
                    </div>
                  </label>

                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mr-2">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>

                {/* If Hybrid Mode is Active */}
                {isHybridPayment && (
                  <div className="mt-4 pt-3 border-t border-indigo-200/70 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                      <span className="text-slate-500 block mb-0.5">کسر از کیف پول:</span>
                      <span className="font-bold text-indigo-700 text-sm">{walletDeduction.toLocaleString('fa-IR')} تومان</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                      <span className="text-slate-500 block mb-0.5">پرداخت در درگاه بانکی:</span>
                      <span className="font-black text-emerald-600 text-sm">{remainingToPay.toLocaleString('fa-IR')} تومان</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Gateway Box */}
              {remainingToPay > 0 && (
                <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        درگاه پرداخت آنلاین شتاب (شاپرک)
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          زرین‌پال
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        پرداخت مبلغ باقیمانده ({remainingToPay.toLocaleString('fa-IR')} تومان) با کلیه کارت‌های عضو شتاب و رمز پویا
                      </div>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                </div>
              )}

            </div>

          </div>

          {/* Left Column - Summary & Payment Action */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)] sticky top-24">
              <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 border-b border-[var(--neo-border)] pb-4">خلاصه صورت‌حساب</h3>
              
              {/* Coupon Code Section */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-2">کد تخفیف</label>
                {effectivePreview?.couponCode ? (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono font-bold text-sm uppercase">{effectivePreview.couponCode}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">اعمال شده</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition"
                    >
                      حذف کد
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neo-text-muted)]" />
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="کد تخفیف دارید؟" 
                        disabled={isApplyingCoupon}
                        className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] focus:border-[var(--neo-secondary)] focus:ring-2 focus:ring-blue-200 rounded-xl py-3 pr-10 pl-4 outline-none transition text-left dir-ltr uppercase text-sm"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isApplyingCoupon || !couponCode.trim()} 
                      className="bg-[var(--neo-text-main)] text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 shrink-0 text-sm flex items-center justify-center min-w-[70px]"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'اعمال'}
                    </button>
                  </form>
                )}
              </div>

              {/* Price Details */}
              <div className="space-y-3.5 mb-6 text-[var(--neo-text-secondary)]">
                <div className="flex justify-between items-center text-sm">
                  <span>مجموع ارزش سفارش</span>
                  <span className="font-bold text-slate-800">{effectivePreview?.subtotal?.toLocaleString('fa-IR')} تومان</span>
                </div>
                {effectivePreview?.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span>مبلغ تخفیف کوپن</span>
                    <span className="font-bold">-{effectivePreview?.discountAmount?.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                
                {/* Wallet Deduction Line */}
                {walletDeduction > 0 && (
                  <div className="flex justify-between items-center text-sm text-indigo-700 bg-indigo-50/70 p-2.5 rounded-xl font-bold border border-indigo-100">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4" />
                      کسر از موجودی کیف پول
                    </span>
                    <span>-{walletDeduction.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[var(--neo-border)] flex justify-between items-center text-lg font-black text-[var(--neo-text-main)]">
                  <span>
                    {remainingToPay > 0 ? 'مبلغ قابل پرداخت درگاه:' : 'مبلغ پرداختی:'}
                  </span>
                  <span className={remainingToPay > 0 ? 'text-emerald-600 text-xl' : 'text-indigo-600 text-xl'}>
                    {remainingToPay > 0 
                      ? `${remainingToPay.toLocaleString('fa-IR')} تومان`
                      : 'رایگان (پرداخت با کیف پول)'
                    }
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[var(--neo-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
                <span className="text-xs text-[var(--neo-text-secondary)] leading-relaxed">
                  قوانین و مقررات وبسایت تک‌یاد و شرایط استفاده را مطالعه کرده‌ام و با آن‌ها موافقم.
                </span>
              </label>

              {/* Final Payment Button */}
              {isFullWalletPayment ? (
                <button 
                  onClick={handleFinalPayment}
                  disabled={!acceptedTerms || isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      پرداخت آنی با کیف پول ({totalAmount.toLocaleString('fa-IR')} تومان)
                    </>
                  )}
                </button>
              ) : isHybridPayment ? (
                <button 
                  onClick={handleFinalPayment}
                  disabled={!acceptedTerms || isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      پرداخت {remainingToPay.toLocaleString('fa-IR')} تومان در درگاه شتاب
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleFinalPayment}
                  disabled={!acceptedTerms || isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      اتصال به درگاه بانکی ({totalAmount.toLocaleString('fa-IR')} تومان)
                    </>
                  )}
                </button>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--neo-text-muted)] bg-[var(--neo-bg)] p-3 rounded-xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                تضمین بازگشت وجه و فعال‌سازی فوری محتوا
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
