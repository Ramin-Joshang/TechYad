'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  MessageSquare, Search, Filter, CheckCircle2, XCircle, 
  Clock, Phone, ShieldCheck, Loader2, Send, ExternalLink, 
  Smartphone, RefreshCw, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SmsLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: resData, isLoading, refetch } = useQuery({
    queryKey: ['smsAuditLogs', statusFilter, search, page],
    queryFn: () => superAdminApi.getAuditLogs({ 
      category: 'sms', 
      status: statusFilter !== 'all' ? statusFilter : undefined, 
      search: search || undefined, 
      page, 
      limit: 25 
    }).then((res: any) => res.data)
  });

  const logs = resData?.logs || [];
  const total = resData?.total || 0;
  const totalPages = resData?.totalPages || 1;

  const successCount = logs.filter((l: any) => l.status === 'success').length;
  const failureCount = logs.filter((l: any) => l.status === 'failure').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">تاریخچه پیامک‌های ارسال‌شده (SMS Logs)</h1>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-0.5">
              رهگیری تمام پیامک‌های کد تایید، اعلان‌های ثبت‌نام، واریز و پیام‌های اطلاع‌رسانی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="بروزرسانی لاگ‌ها"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/super-admin/broadcast"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            ارسال پیامک همگانی
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">کل پیامک‌های ثبتی</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {total.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">سوابق پیامکی سرور</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">تحویل موفق (Delivered)</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
            {successCount.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-emerald-700 mt-2 block">رسیده به گوشی گیرنده</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">ناموفق یا رد شده</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {failureCount.toLocaleString('fa-IR')}
          </div>
          <span className="text-[11px] text-rose-700 mt-2 block">لیست سیاه یا خطای خط</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1">درگاه فعال پیامک</span>
          <div className="text-base font-black text-blue-700 mt-1">
            کاوه نگار / فراز اس‌ام‌اس
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">اتصال مستقیم به وب‌سرویس</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجوی شماره موبایل گیرنده یا متن پیامک..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="success">تحویل موفق</option>
            <option value="failure">ناموفق / خطا</option>
          </select>
        </div>
      </div>

      {/* SMS Logs Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600 mb-2" />
            <span className="text-xs font-bold text-slate-500">در حال دریافت لاگ‌های پیامکی...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 p-4">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">هیچ لاگ پیامکی یافت نشد</h3>
            <p className="text-xs text-slate-400 mt-1">با ارسال اولین اعلان پیامکی، لاگ آن در این صفحه درج می‌شود.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-4">گیرنده / شماره تماس</th>
                  <th className="p-4">عنوان و متن پیام</th>
                  <th className="p-4">سرویس‌دهنده</th>
                  <th className="p-4">وضعیت ارسال</th>
                  <th className="p-4">تاریخ و زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any) => {
                  const isSuccess = log.status === 'success';
                  const details = log.details || {};

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-mono font-bold text-slate-800 dir-ltr text-right">
                        {details.recipient || details.mobile || log.userName || '—'}
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-bold text-slate-900 mb-0.5">{log.action}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {details.message || details.content || details.note || 'ارسال کد احراز هویت / پیام سیستم'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                          {details.provider || 'کاوه نگار'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                          isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isSuccess ? 'تحویل به گیرنده' : 'ناموفق'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('fa-IR') : '—'}
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">صفحه {page} از {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-40"
              >
                قبلی
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg disabled:opacity-40"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
