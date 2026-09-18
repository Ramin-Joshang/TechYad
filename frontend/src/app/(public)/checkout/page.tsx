'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CreditCard, ArrowRight, Loader2, Tag } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Base query: fetch standard cart preview once without coupon
  const { data: baseData, isLoading: isBaseLoading } = useQuery({
    queryKey: ['checkoutPreviewBase'],
    queryFn: () => commerceApi.checkoutPreview().then(res => res.data),
    enabled: isAuthenticated && !isInitializing,
    retry: false,
  });

  // Preview data state that holds either base or coupon-applied preview
  const [previewData, setPreviewData] = useState<any>(null);

  // Synchronize base preview when loaded and no coupon is active
  const effectivePreview = previewData || baseData;

  // Handle Coupon Submit without breaking whole page loading or emptying cart
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
      // Keep existing preview data and cart intact!
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

  // Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      // 1. Create order
      const orderRes = await commerceApi.createOrder(appliedCoupon);
      const orderId = orderRes.data._id;
      
      // 2. Create payment intent
      const paymentRes = await commerceApi.createMockPayment(orderId);
      return paymentRes.data;
    },
    onSuccess: (data) => {
      // Redirect to mock gateway
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ایجاد تراکنش');
    }
  });

  const handlePayment = () => {
    if (!acceptedTerms) {
      toast.error('لطفاً قوانین و مقررات را بپذیرید');
      return;
    }
    paymentMutation.mutate();
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

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] mb-8 transition">
          <ArrowRight className="w-5 h-5" />
          بازگشت به سبد خرید
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Right Column - User Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Info */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۱</div>
                اطلاعات خریدار
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1">نام و نام خانوادگی</label>
                  <div className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 text-[var(--neo-text-main)]">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1">ایمیل</label>
                  <div className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 text-[var(--neo-text-muted)] text-left">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold">۲</div>
                آیتم‌های سفارش
              </h2>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.itemId} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <img src={item.thumbnail || `https://picsum.photos/seed/${item.itemId}/100/100`} alt={item.titleSnapshot} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs text-[var(--neo-primary)] font-medium mb-1">{item.itemType === 'course' ? 'دوره' : 'کلاس'}</div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">{item.titleSnapshot}</h4>
                      </div>
                    </div>
                    <div className="font-bold text-[var(--neo-text-main)]">
                      {item.finalPrice.toLocaleString('fa-IR')} <span className="text-sm font-normal text-[var(--neo-text-muted)]">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Left Column - Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)] sticky top-24">
              <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 border-b border-[var(--neo-border)] pb-4">خلاصه پرداختی</h3>
              
              {/* Coupon */}
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

              <div className="space-y-4 mb-6 text-[var(--neo-text-secondary)]">
                <div className="flex justify-between items-center">
                  <span>مبلغ کل</span>
                  <span className="font-bold">{effectivePreview?.subtotal?.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span>تخفیف</span>
                  <span className="font-bold">{effectivePreview?.discountAmount?.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="pt-4 border-t border-[var(--neo-border)] flex justify-between items-center text-xl font-black text-[var(--neo-text-main)]">
                  <span>قابل پرداخت</span>
                  <span className="text-[var(--neo-primary)]">{effectivePreview?.totalAmount?.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[var(--neo-border)] text-[var(--neo-primary)] focus:ring-blue-500" 
                />
                <span className="text-sm text-[var(--neo-text-secondary)] leading-relaxed">
                  قوانین و مقررات سایت را مطالعه کرده‌ام و با آن‌ها موافقم.
                </span>
              </label>

              <button 
                onClick={handlePayment}
                disabled={!acceptedTerms || paymentMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-[var(--neo-primary)] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-[var(--neo-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    پرداخت {(effectivePreview?.totalAmount || 0).toLocaleString('fa-IR')} تومان
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--neo-text-muted)] bg-[var(--neo-bg)] p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                پرداخت امن از طریق درگاه‌های بانکی عضو شتاب
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
