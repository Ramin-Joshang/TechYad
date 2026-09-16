'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      commerceApi.getOrderById(orderId)
        .then(res => {
          setOrder(res.data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <main className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">پرداخت با موفقیت انجام شد</h1>
        <p className="text-gray-500 mb-8">از خرید شما سپاسگزاریم. سفارش شما با موفقیت ثبت و دوره‌ها به حساب کاربری شما اضافه شدند.</p>
        
        {order && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-right border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
              <span className="text-gray-500">شماره سفارش:</span>
              <span className="font-bold text-gray-900 font-mono text-sm">{order._id}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-500">مبلغ پرداخت شده:</span>
              <span className="font-bold text-emerald-600 text-lg">{order.totalAmount?.toLocaleString('fa-IR')} تومان</span>
            </div>
            
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              دوره‌های خریداری شده:
            </h3>
            <ul className="space-y-2">
              {order.items?.map((item: any) => (
                <li key={item.itemId} className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  {item.titleSnapshot}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/student" className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            شروع یادگیری
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/student/orders" className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition text-center">
            مشاهده سفارشات
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-500 animate-spin" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
