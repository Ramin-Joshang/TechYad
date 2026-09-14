'use client';

import { useQuery } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { Loader2, ArrowRight, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => commerceApi.getOrderById(id).then(res => res.data),
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500">در حال بارگذاری جزئیات سفارش...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-red-100 shadow-sm flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">سفارش یافت نشد</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">متاسفانه سفارش مورد نظر پیدا نشد یا شما دسترسی به آن ندارید.</p>
        <button onClick={() => router.back()} className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition">
          بازگشت به سفارشات
        </button>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isPending = order.status === 'pending';

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <Link href="/student/orders" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
          <ArrowRight className="w-4 h-4" />
          بازگشت به همه سفارشات
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <Receipt className="w-8 h-8 text-purple-600" />
              جزئیات سفارش
            </h1>
            <p className="text-gray-500 font-mono text-sm">شماره سفارش: {order._id}</p>
          </div>
          
          <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${
            isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            isPending ? 'bg-amber-50 border-amber-200 text-amber-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            {isPaid ? <CheckCircle className="w-5 h-5" /> : isPending ? <Clock className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">
              {isPaid ? 'پرداخت موفق' : isPending ? 'در انتظار پرداخت' : 'پرداخت ناموفق/لغو شده'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">آیتم‌های سفارش</h2>
            <div className="space-y-6">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <img src={`https://picsum.photos/seed/${item.itemId}/150/150`} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                    <div className="text-sm text-gray-500 mb-2">{item.itemType === 'course' ? 'دوره آموزشی' : 'کلاس زنده'}</div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="font-bold text-gray-900">{item.price?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {order.paymentDetails && order.paymentDetails.authority && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">اطلاعات درگاه پرداخت</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">کد پیگیری تراکنش (Authority):</span>
                  <span className="font-mono font-bold text-gray-900">{order.paymentDetails.authority}</span>
                </div>
                {order.paymentDetails.refId && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">شماره مرجع (Ref ID):</span>
                    <span className="font-mono font-bold text-gray-900">{order.paymentDetails.refId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl p-6 shadow-sm text-white sticky top-24">
            <h2 className="text-lg font-bold text-white mb-6">خلاصه پرداخت</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>تاریخ ثبت:</span>
                <span className="font-bold text-white">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>مبلغ کل آیتم‌ها:</span>
                <span className="font-bold text-white">{(order.totalAmount + (order.discountAmount || 0)).toLocaleString('fa-IR')} تومان</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>تخفیف اعمال شده:</span>
                  <span className="font-bold">{order.discountAmount.toLocaleString('fa-IR')} تومان</span>
                </div>
              )}
              <div className="w-full h-px bg-gray-800 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-200">مبلغ نهایی:</span>
                <span className="font-black text-xl text-white">{order.totalAmount?.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span></span>
              </div>
            </div>

            {isPending && (
              <button 
                onClick={async () => {
                  try {
                    const res = await commerceApi.createMockPayment(order._id);
                    if (res.data.url) {
                      window.location.href = res.data.url;
                    }
                  } catch (err) {
                    console.error('Failed to initiate payment', err);
                  }
                }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                پرداخت این سفارش
              </button>
            )}
            
            {isPaid && (
              <Link 
                href="/student/courses"
                className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                رفتن به دوره‌های من
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
