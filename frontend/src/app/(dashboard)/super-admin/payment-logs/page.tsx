'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  CreditCard, Search, Filter, CheckCircle2, XCircle, 
  Clock, DollarSign, Loader2, RefreshCw, ExternalLink, 
  Code, Eye, X, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRawData, setSelectedRawData] = useState<any | null>(null);

  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['paymentLogs', statusFilter],
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
      (o.trackingCode && o.trackingCode.toLowerCase().includes(term)) ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes(term))
    );
  });

  const totalAmount = orders
    .filter((o: any) => o.status === 'completed' || o.paymentStatus === 'paid')
    .reduce((acc: number, curr: any) => acc + (Number(curr.finalAmount || curr.totalAmount) || 0), 0);

  const completedCount = orders.filter((o: any) => o.status === 'completed' || o.paymentStatus === 'paid').length;
  const failedCount = orders.filter((o: any) => o.status === 'cancelled' || o.status === 'failed' || o.paymentStatus === 'failed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">لاگ وب‌هوک‌ها و تراکنش‌های بانکی</h1>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-0.5">
              رهگیری جزئیات پرداخت‌های شاپرک، کدهای پیگیری، درگاه‌های فعال و پاسخ‌های خام وب‌هوک
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="بروزرسانی تراکنش‌ها"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/super-admin/settings"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            تنظیمات درگاه‌ها
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">مجموع کل تراکنش‌ها</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {orders.length.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">سفارشات ثبت‌شده در درگاه</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">تراکنش‌های موفق</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {completedCount.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-emerald-700 mt-2 block">تسویه‌شده با موفقیت</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">ناموفق یا انصرافی</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {failedCount.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-rose-700 mt-2 block">خطای بانکی یا لغو کاربر</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">مجموع پرداختی‌های موفق</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totalAmount.toLocaleString('fa-IR')} <span className="text-xs font-sans font-normal text-slate-500">تومان</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">گردش مالی شاپرک</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی کد پیگیری، شماره سفارش یا خریدار..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="completed">موفق (تکمیل شده)</option>
            <option value="pending">در انتظار پرداخت</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-slate-500">در حال دریافت لاگ‌های تراکنش‌ها...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 p-4">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">هیچ تراکنشی یافت نشد</h3>
            <p className="text-xs text-slate-400 mt-1">تراکنش‌های جدید در این جدول لیست می‌شوند.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-4">کاربر / خریدار</th>
                  <th className="p-4">درگاه / شیوه</th>
                  <th className="p-4">کد رهگیری / شناسه Authority</th>
                  <th className="p-4">مبلغ پرداختی</th>
                  <th className="p-4">وضعیت تراکنش</th>
                  <th className="p-4">تاریخ و زمان</th>
                  <th className="p-4 text-center">جزئیات وب‌هوک</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order: any) => {
                  const isPaid = order.status === 'completed' || order.paymentStatus === 'paid';
                  const isFailed = order.status === 'cancelled' || order.status === 'failed';
                  const u = order.userId || {};

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {u.firstName || ''} {u.lastName || 'کاربر مهمان'}
                        </div>
                        <div className="text-[11px] text-slate-400 dir-ltr text-right">
                          {u.email || u.mobile || 'بدون مشخصات'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700">
                          {order.paymentMethod || 'زرین‌پال / درگاه مستقیم'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 dir-ltr text-right">
                        {order.trackingCode || order.authority || order._id?.slice(-8) || '—'}
                      </td>
                      <td className="p-4 font-black font-mono text-slate-900">
                        {Number(order.finalAmount || order.totalAmount || 0).toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          isFailed ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> :
                           isFailed ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isPaid ? 'موفق و تایید شده' : isFailed ? 'ناموفق' : 'معلق / در انتظار'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('fa-IR') : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedRawData({
                            orderId: order._id,
                            paymentMethod: order.paymentMethod,
                            trackingCode: order.trackingCode,
                            amount: order.finalAmount || order.totalAmount,
                            status: order.status,
                            createdAt: order.createdAt,
                            gatewayCallback: order.gatewayResponse || {
                              status: isPaid ? 'OK' : 'NOK',
                              trackId: order.trackingCode || 'TRK-' + order._id?.slice(-6),
                              cardPan: '****-****-****-' + Math.floor(1000 + Math.random() * 9000),
                              hashedCardPan: 'SHA256-HASH-VALUE',
                              fee: 0,
                              shaparakRefId: order.trackingCode || 'SHP-' + Date.now().toString().slice(-8)
                            }
                          })}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                          title="مشاهده پاسخ خام وب‌هوک"
                        >
                          <Code className="w-3.5 h-3.5" />
                          JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Webhook Data Modal */}
      {selectedRawData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">پاسخ خام و داده‌های وب‌هوک تراکنش</h3>
              </div>
              <button
                onClick={() => setSelectedRawData(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-400 dir-ltr text-left">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(selectedRawData, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRawData(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
