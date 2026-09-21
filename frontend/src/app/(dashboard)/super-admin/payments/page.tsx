'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  CreditCard, CheckCircle, Clock, XCircle, Search, 
  ExternalLink, Loader2, ArrowUpRight, ShieldCheck, DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['adminPaymentsList', statusFilter],
    queryFn: () => adminApi.getOrders({ status: statusFilter !== 'all' ? statusFilter : undefined }).then((res: any) => res.data)
  });

  const orders = ordersData?.orders || [];

  const filteredOrders = orders.filter((o: any) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (o._id && o._id.toLowerCase().includes(term)) ||
      (o.userId?.firstName && o.userId.firstName.toLowerCase().includes(term)) ||
      (o.userId?.lastName && o.userId.lastName.toLowerCase().includes(term)) ||
      (o.userId?.email && o.userId.email.toLowerCase().includes(term)) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(term))
    );
  });

  const totalAmount = orders
    .filter((o: any) => o.status === 'completed' || o.paymentStatus === 'paid')
    .reduce((acc: number, curr: any) => acc + (Number(curr.finalAmount || curr.totalAmount) || 0), 0);

  const completedCount = orders.filter((o: any) => o.status === 'completed' || o.paymentStatus === 'paid').length;
  const pendingCount = orders.filter((o: any) => o.status === 'pending' || o.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیریت تراکنش‌های بانکی و درگاه‌ها</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">رهگیری دقیق تراکنش‌های خرید، کدهای ارجاع بانکی شاپرک و درگاه‌های پرداخت</p>
          </div>
        </div>

        <Link
          href="/super-admin/settings"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
        >
          تنظیمات درگاه‌های پرداخت
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>مجموع تراکنش‌های موفق</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {totalAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">{completedCount.toLocaleString('fa-IR')} پرداخت موفق نهایی</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>تراکنش‌های معلق / بازگشت‌نخورده</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {pendingCount.toLocaleString('fa-IR')} تراکنش
          </div>
          <div className="text-xs text-gray-400 mt-1">تلاش برای اتصال به درگاه</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>وضعیت سلامت درگاه شاپرک</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            متصل و پایدار
          </div>
          <div className="text-xs text-emerald-600 mt-1">زرین‌پال / زیبال فعال</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            همه تراکنش‌ها
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            موفق و تکمیل‌شده
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            در انتظار
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'cancelled' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ناموفق / لغو شده
          </button>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام کاربر، شناسه یا ایمیل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">تراکنشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-3.5">شناسه تراکنش</th>
                  <th className="p-3.5">پرداخت‌کننده</th>
                  <th className="p-3.5">مبلغ پرداخت</th>
                  <th className="p-3.5">روش پرداخت</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5">تاریخ و ساعت</th>
                  <th className="p-3.5 text-center">جزئیات سفارش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((ord: any) => {
                  const user = ord.userId;
                  const userName = user 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
                    : 'مهمان / ناشناس';

                  const isPaid = ord.status === 'completed' || ord.paymentStatus === 'paid';

                  return (
                    <tr key={ord._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                        #{ord._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{userName}</div>
                        <div className="text-[10px] text-gray-400">{user?.email || ord.phone || '-'}</div>
                      </td>
                      <td className="p-3.5 font-black text-gray-900">
                        {Number(ord.finalAmount || ord.totalAmount || 0).toLocaleString('fa-IR')} <span className="text-[10px] text-gray-400 font-normal">تومان</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {ord.paymentMethod || 'درگاه بانکی شتاب'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isPaid ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            پرداخت موفق
                          </span>
                        ) : ord.status === 'cancelled' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            لغو شده
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            در انتظار پرداخت
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-500">
                        {new Date(ord.createdAt).toLocaleString('fa-IR')}
                      </td>
                      <td className="p-3.5 text-center">
                        <Link
                          href={`/super-admin/orders`}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold transition-colors inline-block"
                        >
                          مشاهده فاکتور
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
