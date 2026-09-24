'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, CreditCard, ArrowRight, Loader2, Tag, 
  Wallet, CheckCircle2, AlertCircle, PlusCircle, Sparkles 
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
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'gateway'>('wallet');

  // Quick Charge Modal
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [customChargeAmount, setCustomChargeAmount] = useState<number>(100000);
  const [isCharging, setIsCharging] = useState(false);

  // Fetch standard cart preview with live wallet balance
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
  const hasEnoughWalletBalance = currentWalletBalance >= totalAmount;
  const walletShortage = Math.max(0, totalAmount - currentWalletBalance);

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

  // Payment with Gateway
  const gatewayMutation = useMutation({
    mutationFn: async () => {
      const orderRes = await commerceApi.createOrder(appliedCoupon);
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

  // Payment with Wallet
  const walletPaymentMutation = useMutation({
    mutationFn: async () => {
      const orderRes = await commerceApi.createOrder(appliedCoupon);
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

    if (paymentMethod === 'wallet') {
      if (!hasEnoughWalletBalance) {
        toast.error('موجودی کیف پول شما کافی نیست. لطفاً ابتدا کیف پول خود را شارژ کنید.');
        setShowChargeModal(true);
        return;
      }
      walletPaymentMutation.mutate();
    } else {
      gatewayMutation.mutate();
    }
  };

  // Quick Charge Handler
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
          
          {/* Right Column - User Info, Items & Payment Method */}
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

            {/* Step 3: Payment Method Selection */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۳</div>
                انتخاب روش پرداخت
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Method 1: Wallet */}
                <div 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'wallet' 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          کیف پول تک‌یاد
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                            پرداخت آنی ۱ کلیکه
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          موجودی فعلی: <span className="font-bold text-slate-800">{currentWalletBalance.toLocaleString('fa-IR')} تومان</span>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'wallet' && (
                      <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                    )}
                  </div>

                  {/* Wallet Balance Status */}
                  {hasEnoughWalletBalance ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-xl mt-3 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      موجودی کافی است. فعال‌سازی آنی بدون انتقال به درگاه بانکی.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-xl font-medium">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                          کسری موجودی: {walletShortage.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowChargeModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 py-2 rounded-xl transition"
                      >
                        <PlusCircle className="w-4 h-4" />
                        شارژ سریع به مبلغ کسری ({walletShortage.toLocaleString('fa-IR')} ت)
                      </button>
                    </div>
                  )}
                </div>

                {/* Method 2: Online Gateway */}
                <div 
                  onClick={() => setPaymentMethod('gateway')}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'gateway' 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          درگاه پرداخت آنلاین شتاب
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          زرین‌پال / کلیه کارت‌های بانکی عضو شتاب
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'gateway' && (
                      <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-2.5 rounded-xl mt-3 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    پرداخت ایمن با رمز پویا از طریق شاپرک
                  </div>
                </div>

              </div>
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
              <div className="space-y-4 mb-6 text-[var(--neo-text-secondary)]">
                <div className="flex justify-between items-center text-sm">
                  <span>مجموع ارزش دوره‌ها</span>
                  <span className="font-bold">{effectivePreview?.subtotal?.toLocaleString('fa-IR')} تومان</span>
                </div>
                {effectivePreview?.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span>مبلغ تخفیف</span>
                    <span className="font-bold">-{effectivePreview?.discountAmount?.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                <div className="pt-4 border-t border-[var(--neo-border)] flex justify-between items-center text-xl font-black text-[var(--neo-text-main)]">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="text-indigo-600">{totalAmount.toLocaleString('fa-IR')} تومان</span>
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
                  قوانین و مقررات وبسایت تک‌یاد و حریم خصوصی را مطالعه کرده‌ام و با آن‌ها موافقم.
                </span>
              </label>

              {/* Pay Button */}
              {paymentMethod === 'wallet' ? (
                <button 
                  onClick={handleFinalPayment}
                  disabled={!acceptedTerms || isProcessingPayment}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isProcessingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasEnoughWalletBalance ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      پرداخت آنی با کیف پول ({totalAmount.toLocaleString('fa-IR')} تومان)
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      شارژ کیف پول و پرداخت ({totalAmount.toLocaleString('fa-IR')} تومان)
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

      {/* Quick Charge Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">شارژ سریع کیف پول</h3>
                  <p className="text-xs text-slate-500">افزایش موجودی و بازگشت به پرداخت</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChargeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs text-slate-600">
                <span>موجودی فعلی شما:</span>
                <span className="font-bold">{currentWalletBalance.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>مبلغ قابل پرداخت سفارش:</span>
                <span className="font-bold text-indigo-600">{totalAmount.toLocaleString('fa-IR')} تومان</span>
              </div>
              {walletShortage > 0 && (
                <div className="flex justify-between text-xs text-amber-700 font-bold pt-2 border-t border-slate-200">
                  <span>حداقل شارژ مورد نیاز:</span>
                  <span>{walletShortage.toLocaleString('fa-IR')} تومان</span>
                </div>
              )}
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب مبلغ شارژ:</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {walletShortage > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomChargeAmount(walletShortage)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      customChargeAmount === walletShortage
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    دقیقاً مبلغ کسری ({walletShortage.toLocaleString('fa-IR')})
                  </button>
                )}
                {[100000, 200000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomChargeAmount(amt)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      customChargeAmount === amt
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {amt.toLocaleString('fa-IR')} تومان
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={customChargeAmount || ''}
                  onChange={(e) => setCustomChargeAmount(Number(e.target.value))}
                  placeholder="یا مبلغ دلخواه به تومان..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left font-bold text-slate-900 outline-none focus:border-indigo-500 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">تومان</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleQuickCharge(customChargeAmount)}
                disabled={isCharging || !customChargeAmount || customChargeAmount < 10000}
                className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isCharging ? <Loader2 className="w-5 h-5 animate-spin" /> : 'انتقال به درگاه و افزایش اعتبار'}
              </button>
              <button
                type="button"
                onClick={() => setShowChargeModal(false)}
                className="px-4 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
