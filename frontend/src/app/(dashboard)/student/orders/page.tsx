'use client';

import { useQuery } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { CreditCard, Loader2, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => commerceApi.getMyOrders().then(res => res.data)
  });

  const orders = ordersData || [];
  
  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(search.toLowerCase()) || 
    (o.refId && o.refId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-600" />
            سفارشات من
          </h1>
          <p className="text-gray-500">تاریخچه خریدها و تراکنش‌های شما در پلتفرم.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو با شماره سفارش یا کد پیگیری..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری سفارشات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">سفارشی یافت نشد</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">شما هنوز هیچ سفارشی ثبت نکرده‌اید و یا نتیجه‌ای برای جستجوی شما یافت نشد.</p>
          <Link href="/courses" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20">
            شروع یادگیری
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">شماره سفارش</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">تاریخ</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">مبلغ کل</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">تعداد آیتم</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">وضعیت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {order.totalAmount?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-500">تومان</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {order.items?.length || 0}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'paid' ? 'پرداخت شده' : order.status === 'pending' ? 'در انتظار پرداخت' : 'لغو شده'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/student/orders/${order._id}`} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition">
                        مشاهده جزئیات
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
