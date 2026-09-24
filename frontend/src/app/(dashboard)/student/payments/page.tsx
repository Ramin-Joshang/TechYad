'use client';

import { useQuery } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { 
  CreditCard, Loader2, ArrowLeft, Search, CheckCircle2, 
  Clock, XCircle, Wallet, Receipt, ShieldCheck, Download, 
  ExternalLink, Printer, Calendar, Tag, ChevronDown, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function StudentPaymentsHubPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'wallet' | 'gateway' | 'hybrid'>('all');

  // Fetch student orders with enriched payments
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => commerceApi.getMyOrders().then(res => res.data)
  });

  // Fetch wallet overview for student
  const { data: walletData, isLoading: isWalletLoading } = useQuery({
    queryKey: ['myWalletOverview'],
    queryFn: () => walletApi.getOverview().then(res => res.data)
  });

  const orders: any[] = ordersData || [];

  // Financial Metrics
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalDiscountSaved = 0;
    let successfulCount = 0;
    let pendingCount = 0;

    orders.forEach(order => {
      if (order.status === 'paid') {
        totalInvested += order.totalAmount || 0;
        totalDiscountSaved += order.discountAmount || 0;
        successfulCount++;
      } else if (order.status === 'pending') {
        pendingCount++;
      }
    });

    return {
      totalInvested,
      totalDiscountSaved,
      successfulCount,
      pendingCount,
      walletBalance: walletData?.balance || 0
    };
  }, [orders, walletData]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        order._id?.toLowerCase().includes(searchLower) ||
        order.paymentDetails?.authority?.toLowerCase().includes(searchLower) ||
        order.paymentDetails?.referenceId?.toLowerCase().includes(searchLower) ||
        order.items?.some((i: any) => i.title?.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;

      // Method filter
      if (methodFilter !== 'all') {
        const method = order.paymentMethod || 
          (order.walletAmountApplied > 0 && order.gatewayAmount > 0 ? 'hybrid' : 
           order.walletAmountApplied > 0 ? 'wallet' : 'gateway');
        if (method !== methodFilter) return false;
      }

      return true;
    });
  }, [orders, search, statusFilter, methodFilter]);

  const isLoading = isOrdersLoading || isWalletLoading;

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>پنل دانشجو</span>
            <span aria-hidden="true">·</span>
            <span className="text-purple-600 font-semibold">امور مالی و پرداخت‌ها</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-600" />
            تاریخچه پرداخت‌ها و فاکتورها
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            مشاهده صورت‌حساب‌ها، جزئیات تراکنش‌های شاپرک، کسر کیف پول و دریافت فاکتور رسمی معتبر.
          </p>
        </div>

        <Link
          href="/student/wallet"
          className="inline-flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-5 py-2.5 rounded-xl font-bold text-sm transition self-start md:self-auto"
        >
          <Wallet className="w-4 h-4" />
          مدیریت کیف پول
        </Link>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>مجموع سرمایه‌گذاری آموزشی</span>
            <CreditCard className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.totalInvested.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-500">تومان</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>مجموع تخفیف‌های دریافت‌شده</span>
            <Tag className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {stats.totalDiscountSaved.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-500">تومان صرفه‌جویی</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>تراکنش‌های موفق</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {stats.successfulCount.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-500">سفارش پرداخت‌شده</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>موجودی کیف پول تک‌یاد</span>
            <Wallet className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">
              {stats.walletBalance.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-slate-500">تومان قابل استفاده</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            همه تراکنش‌ها ({orders.length.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              statusFilter === 'paid'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            موفق ({stats.successfulCount.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              statusFilter === 'pending'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            در انتظار ({stats.pendingCount.toLocaleString('fa-IR')})
          </button>
        </div>

        {/* Search & Method Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={methodFilter}
            onChange={(e: any) => setMethodFilter(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">همه روش‌ها</option>
            <option value="gateway">درگاه شتاب (بانک)</option>
            <option value="wallet">کیف پول</option>
            <option value="hybrid">ترکیبی (کیف پول + شتاب)</option>
          </select>

          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی شماره سفارش یا کد رهگیری..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
            />
          </div>
        </div>

      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
          <p className="text-slate-600 text-sm font-medium">در حال بارگذاری تراکنش‌ها و سفارشات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-6">
            <Receipt className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {search ? 'سفارشی مطابق جستجو پیدا نشد' : 'هنوز تراکنشی ثبت نکرده‌اید'}
          </h3>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            {search
              ? 'لطفاً شماره سفارش یا کد رهگیری دیگری را امتحان کنید.'
              : 'پس از ثبت‌نام در دوره‌ها یا شارژ کیف پول، تاریخچه کامل پرداخت‌ها و فاکتورهای رسمی در این بخش در دسترس خواهند بود.'}
          </p>
          <Link
            href="/courses"
            className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-3 rounded-xl font-bold text-sm transition shadow-sm"
          >
            مشاهده دوره‌ها و شروع خرید
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <th className="py-4 px-6 font-bold">شماره سفارش / فاکتور</th>
                  <th className="py-4 px-6 font-bold">تاریخ و ساعت</th>
                  <th className="py-4 px-6 font-bold">آیتم‌های خریداری شده</th>
                  <th className="py-4 px-6 font-bold">روش پرداخت</th>
                  <th className="py-4 px-6 font-bold">مبلغ نهایی</th>
                  <th className="py-4 px-6 font-bold">وضعیت</th>
                  <th className="py-4 px-6 font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map((order: any) => {
                  const isPaid = order.status === 'paid';
                  const isPending = order.status === 'pending';
                  const isFailed = order.status === 'failed';

                  const walletApplied = order.walletAmountApplied || 0;
                  const gatewayPaid = order.gatewayAmount || (walletApplied === 0 ? order.totalAmount : 0);
                  const isHybrid = walletApplied > 0 && gatewayPaid > 0;

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/60 transition group">
                      
                      {/* Order ID & Invoice */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-slate-400" />
                          #{order._id.slice(-6).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          فاکتور: TY-INV-{order._id.slice(-4).toUpperCase()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-600">
                        <div>{new Date(order.createdAt).toLocaleDateString('fa-IR')}</div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 line-clamp-1 max-w-xs">
                          {order.items?.[0]?.titleSnapshot || order.items?.[0]?.title || 'دوره آموزشی تک‌یاد'}
                        </div>
                        {order.items?.length > 1 && (
                          <span className="text-xs text-indigo-600 font-bold block mt-0.5">
                            + {order.items.length - 1} مورد دیگر
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6 text-xs">
                        {isHybrid ? (
                          <div>
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">ترکیبی (کیف پول + شتاب)</span>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {walletApplied.toLocaleString('fa-IR')} کسر از کیف + {gatewayPaid.toLocaleString('fa-IR')} شتاب
                            </div>
                          </div>
                        ) : walletApplied > 0 ? (
                          <div className="font-bold text-indigo-700 flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5" />
                            پرداخت کامل با کیف پول
                          </div>
                        ) : (
                          <div className="font-bold text-emerald-700 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" />
                            درگاه شتاب شاپرک
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 text-base">
                          {order.totalAmount?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
                        </div>
                        {order.discountAmount > 0 && (
                          <span className="text-[11px] text-emerald-600 font-medium block">
                            {order.discountAmount.toLocaleString('fa-IR')} تخفیف
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          isPending ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : isPending ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {isPaid ? 'پرداخت موفق' : isPending ? 'در انتظار پرداخت' : 'ناموفق'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <Link 
                          href={`/student/orders/${order._id}`} 
                          className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
                        >
                          مشاهده و چاپ فاکتور
                          <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
