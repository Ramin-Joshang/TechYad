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

  // Fetch Checkout Preview
  const { data: previewData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['checkoutPreview', appliedCoupon],
    queryFn: () => commerceApi.checkoutPreview(appliedCoupon).then(res => res.data),
    enabled: isAuthenticated && !isInitializing,
    retry: false,
  });

  // Handle Coupon Submit
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setAppliedCoupon(couponCode);
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

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold mb-4">لطفاً وارد حساب کاربری خود شوید</h2>
        <button onClick={() => router.push('/login?redirect=/checkout')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">
          ورود به حساب
        </button>
      </div>
    );
  }

  const items = previewData?.items || [];
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-2xl font-bold mb-4">سبد خرید شما خالی است</h2>
        <button onClick={() => router.push('/cart')} className="bg-blue-600 text-white px-6 py-2 rounded-xl">
          بازگشت به سبد خرید
        </button>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition">
          <ArrowRight className="w-5 h-5" />
          بازگشت به سبد خرید
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Right Column - User Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* User Info */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">۱</div>
                اطلاعات خریدار
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 text-left">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">۲</div>
                آیتم‌های سفارش
              </h2>
              <div className="space-y-4">
                {items.map((item: any) => (
                  <div key={item.itemId} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <img src={item.thumbnail || `https://picsum.photos/seed/${item.itemId}/100/100`} alt={item.titleSnapshot} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs text-blue-600 font-medium mb-1">{item.itemType === 'course' ? 'دوره' : 'کلاس'}</div>
                        <h4 className="font-bold text-gray-900">{item.titleSnapshot}</h4>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {item.finalPrice.toLocaleString('fa-IR')} <span className="text-sm font-normal text-gray-500">تومان</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Left Column - Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">خلاصه پرداختی</h3>
              
              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">کد تخفیف</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="کد تخفیف دارید؟" 
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl py-3 pr-10 pl-4 outline-none transition text-left dir-ltr uppercase"
                    />
                  </div>
                  <button type="submit" disabled={isRefetching || !couponCode.trim()} className="bg-gray-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 shrink-0">
                    {isRefetching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'اعمال'}
                  </button>
                </div>
                {previewData?.couponCode && (
                  <p className="text-emerald-600 text-sm mt-2 font-medium flex items-center gap-1">
                    کد تخفیف {previewData.couponCode} با موفقیت اعمال شد.
                  </p>
                )}
              </form>

              <div className="space-y-4 mb-6 text-gray-600">
                <div className="flex justify-between items-center">
                  <span>مبلغ کل</span>
                  <span className="font-bold">{previewData?.subtotal?.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600">
                  <span>تخفیف</span>
                  <span className="font-bold">{previewData?.discountAmount?.toLocaleString('fa-IR')} تومان</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xl font-black text-gray-900">
                  <span>قابل پرداخت</span>
                  <span className="text-blue-600">{previewData?.totalAmount?.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  قوانین و مقررات سایت را مطالعه کرده‌ام و با آن‌ها موافقم.
                </span>
              </label>

              <button 
                onClick={handlePayment}
                disabled={!acceptedTerms || paymentMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    پرداخت {(previewData?.totalAmount || 0).toLocaleString('fa-IR')} تومان
                  </>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
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
