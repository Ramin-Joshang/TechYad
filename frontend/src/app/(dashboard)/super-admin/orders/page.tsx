'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  ShoppingBag, Search, Filter, CheckCircle2, Clock, 
  XCircle, RotateCcw, Eye, ArrowUpDown, Download, 
  Loader2, User, CreditCard, Tag, BookOpen, Video, ExternalLink, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SuperAdminOrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch orders with filters
  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['superAdminOrders', statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: 15,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined
      };
      const res = await adminApi.getOrders(params);
      return res?.data || res;
    },
    placeholderData: (previousData) => previousData
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    paidCount: 0,
    pendingCount: 0,
    refundedCount: 0,
    failedCount: 0,
    averageOrderValue: 0
  };
  const totalPages = data?.pages || 1;

  // Mutation to update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: (res) => {
      toast.success('وضعیت سفارش با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminDashboardStats'] });
      if (selectedOrder) {
        setSelectedOrder((prev: any) => ({ ...prev, status: res?.data?.status || res?.status }));
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت سفارش');
    }
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const statusNames: Record<string, string> = {
      paid: 'پرداخت شده (ثبت‌نام خودکار)',
      pending: 'در انتظار پرداخت',
      refunded: 'مرجوع شده (لغو دسترسی)',
      failed: 'ناموفق'
    };
    if (confirm(`آیا از تغییر وضعیت سفارش به «${statusNames[newStatus]}» اطمینان دارید؟`)) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            پرداخت موفق
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            در انتظار پرداخت
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5" />
            مرجوع شده
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            ناموفق
          </span>
        );
    }
  };

  const openOrderDetails = async (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    try {
      const full = await adminApi.getOrderById(order._id);
      if (full?.data?.order) {
        setSelectedOrder(full.data.order);
      }
    } catch (e) {
      // fallback to already loaded order data
    }
  };

  const handleExportCSV = () => {
    if (!orders.length) {
      toast.error('داده‌ای برای خروجی وجود ندارد');
      return;
    }
    const headers = ['شناسه', 'کاربر', 'ایمیل', 'مبلغ کل', 'تخفیف', 'وضعیت', 'تاریخ'];
    const rows = orders.map((o: any) => [
      o._id,
      `${o.userId?.firstName || ''} ${o.userId?.lastName || ''}`.trim() || 'کاربر',
      o.userId?.email || '',
      o.totalAmount,
      o.discountAmount || 0,
      o.status,
      new Date(o.createdAt).toLocaleDateString('fa-IR')
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('فایل گزارش با موفقیت دانلود شد');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 text-[var(--neo-primary)] rounded-2xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--neo-text-main)]">مدیریت سفارشات کلان</h1>
              <p className="text-[var(--neo-text-secondary)] text-sm mt-1">بررسی مالی، تغییر وضعیت تراکنش‌ها و مدیریت ثبت‌نام کاربران</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-[var(--neo-surface-2)] hover:bg-gray-200 text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm text-sm"
          >
            <Download className="w-4 h-4" />
            خروجی اکسل / CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-[var(--neo-text-secondary)] mb-1">درآمد کل (موفق)</div>
          <div className="text-xl font-black text-emerald-600">{stats.totalRevenue?.toLocaleString('fa-IR')} <span className="text-xs text-gray-500 font-normal">تومان</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-[var(--neo-text-secondary)] mb-1">کل سفارشات</div>
          <div className="text-xl font-black text-[var(--neo-text-main)]">{stats.totalOrders?.toLocaleString('fa-IR')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 mb-1">پرداخت شده</div>
          <div className="text-xl font-black text-emerald-600">{stats.paidCount?.toLocaleString('fa-IR')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-amber-600 mb-1">در انتظار پرداخت</div>
          <div className="text-xl font-black text-amber-600">{stats.pendingCount?.toLocaleString('fa-IR')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-purple-600 mb-1">مرجوع شده</div>
          <div className="text-xl font-black text-purple-600">{stats.refundedCount?.toLocaleString('fa-IR')}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-blue-600 mb-1">میانگین سبد خرید</div>
          <div className="text-xl font-black text-blue-600">{stats.averageOrderValue?.toLocaleString('fa-IR')} <span className="text-xs text-gray-500 font-normal">تومان</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو بر اساس شناسه، نام کاربر یا ایمیل..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'همه' },
            { id: 'paid', label: 'پرداخت شده' },
            { id: 'pending', label: 'در انتظار' },
            { id: 'refunded', label: 'مرجوعی' },
            { id: 'failed', label: 'ناموفق' }
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => {
                setStatusFilter(status.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                statusFilter === status.id
                  ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
            <p className="text-sm text-gray-500 font-medium">در حال دریافت لیست سفارشات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">هیچ سفارشی یافت نشد</h3>
            <p className="text-sm text-gray-500 mt-1">با فیلترها یا عبارت جستجوی دیگری مجدداً تلاش کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-4">شناسه</th>
                  <th className="p-4">کاربر خریدار</th>
                  <th className="p-4">اقلام سفارش</th>
                  <th className="p-4">مبلغ کل</th>
                  <th className="p-4">تخفیف</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {orders.map((order: any) => {
                  const itemsCount = order.items?.length || 0;
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-500 text-xs">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-[var(--neo-primary)] font-black flex items-center justify-center text-sm shrink-0">
                            {order.userId?.firstName?.[0] || 'ک'}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--neo-text-main)]">
                              {order.userId ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() : 'کاربر حذف شده'}
                            </div>
                            <div className="text-xs text-gray-400 font-mono" dir="ltr">{order.userId?.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs truncate font-medium text-gray-700">
                          {firstItem?.titleSnapshot || 'بدون آیتم'}
                          {itemsCount > 1 && (
                            <span className="mr-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                              +{itemsCount - 1} مورد دیگر
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-black text-[var(--neo-text-main)]">
                        {order.totalAmount?.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-400">تومان</span>
                      </td>
                      <td className="p-4">
                        {order.discountAmount > 0 ? (
                          <span className="text-emerald-600 font-bold">
                            {order.discountAmount.toLocaleString('fa-IR')} تومان
                            {order.couponId?.code && (
                              <span className="mr-1 text-xs px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                                {order.couponId.code}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Quick Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updateStatusMutation.isPending}
                            className="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] cursor-pointer"
                          >
                            <option value="paid">تایید پرداخت</option>
                            <option value="pending">در انتظار</option>
                            <option value="refunded">مرجوع</option>
                            <option value="failed">ناموفق</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--neo-border)] flex items-center justify-between">
            <div className="text-sm text-gray-500">
              صفحه {currentPage} از {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--neo-surface-2)] disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                قبلی
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--neo-surface-2)] disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--neo-border)] animate-in zoom-in-95">
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-black text-[var(--neo-text-main)]">
                  جزئیات کامل سفارش #{selectedOrder._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ثبت شده در {new Date(selectedOrder.createdAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Status and Action banner */}
              <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600">وضعیت فعلی:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">تغییر به:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    className="text-xs font-bold py-2 px-3 rounded-xl border border-blue-200 bg-white text-blue-700 focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] cursor-pointer"
                  >
                    <option value="paid">پرداخت شده (ثبت‌نام فعال)</option>
                    <option value="pending">در انتظار پرداخت</option>
                    <option value="refunded">مرجوع شده (لغو ثبت‌نام)</option>
                    <option value="failed">ناموفق</option>
                  </select>
                </div>
              </div>

              {/* Customer details card */}
              <div className="p-5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    مشخصات خریدار
                  </h4>
                  {selectedOrder.userId?._id && (
                    <Link
                      href={`/super-admin/users/${selectedOrder.userId._id}`}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      پروفایل کامل کاربر <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">نام و نام خانوادگی</span>
                    <span className="font-bold text-gray-800">
                      {selectedOrder.userId?.firstName} {selectedOrder.userId?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">پست الکترونیک</span>
                    <span className="font-bold text-gray-800 font-mono" dir="ltr">{selectedOrder.userId?.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">شماره همراه</span>
                    <span className="font-bold text-gray-800 font-mono" dir="ltr">{selectedOrder.userId?.mobile || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  اقلام خریداری شده ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl border border-[var(--neo-border)] bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-[var(--neo-primary)]">
                          {item.itemType === 'class' ? <Video className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--neo-text-main)]">{item.titleSnapshot}</div>
                          <div className="text-xs text-gray-400">
                            نوع: {item.itemType === 'class' ? 'کلاس زنده / وبینار' : 'دوره آموزشی'}
                          </div>
                        </div>
                      </div>
                      <div className="text-left font-black text-sm text-gray-800">
                        {item.finalPrice?.toLocaleString('fa-IR')} تومان
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-5 rounded-2xl border border-[var(--neo-border)] bg-gray-50 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>مجموع ناخالص (Subtotal):</span>
                  <span className="font-bold">{selectedOrder.subtotal?.toLocaleString('fa-IR')} تومان</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      تخفیف اعمال شده:
                      {selectedOrder.couponId?.code && ` (${selectedOrder.couponId.code})`}
                    </span>
                    <span>- {selectedOrder.discountAmount.toLocaleString('fa-IR')} تومان</span>
                  </div>
                )}
                <div className="border-t border-[var(--neo-border)] pt-2 flex justify-between text-base font-black text-blue-900">
                  <span>مبلغ پرداختی نهایی:</span>
                  <span>{selectedOrder.totalAmount?.toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-[var(--neo-border)] flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold text-sm transition-colors"
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
