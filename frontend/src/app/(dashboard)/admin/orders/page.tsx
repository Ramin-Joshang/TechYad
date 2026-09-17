'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, List, CheckCircle, Clock } from 'lucide-react';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => adminApi.getOrders().then(res => res.data)
  });

  const orders = ordersData?.orders || [];
  const filteredOrders = orders.filter((o: any) => 
    o._id?.toLowerCase().includes(search.toLowerCase()) || 
    (o.userId?.firstName + ' ' + o.userId?.lastName).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><List className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">سفارشات پلتفرم</h1>
            <p className="text-gray-500 mt-1">مدیریت تراکنش‌ها و خریدهای دوره‌ها</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو با شناسه سفارش یا نام خریدار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
        ) : filteredOrders.length === 0 ? (
           <div className="p-12 text-center text-gray-500 font-medium">سفارشی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-600 text-sm">شناسه سفارش</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">خریدار</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">مبلغ (تومان)</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">وضعیت</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-600 dir-ltr text-right text-sm">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      {order.userId?.firstName} {order.userId?.lastName}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {order.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> پرداخت شده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700">
                          <Clock className="w-3.5 h-3.5" /> در انتظار
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-sm font-medium">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
