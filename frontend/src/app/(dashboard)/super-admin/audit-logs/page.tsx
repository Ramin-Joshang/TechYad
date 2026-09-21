'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  History, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, AlertTriangle, User, Globe, Loader2, ArrowUpDown
} from 'lucide-react';

export default function AuditLogsPage() {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: resData, isLoading } = useQuery({
    queryKey: ['auditLogs', category, status, search, page],
    queryFn: () => superAdminApi.getAuditLogs({ category, status, search, page, limit: 25 }).then((res: any) => res.data)
  });

  const logs = resData?.logs || [];
  const total = resData?.total || 0;
  const totalPages = resData?.totalPages || 1;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'auth': return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">احراز هویت</span>;
      case 'course': return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">دوره و محتوا</span>;
      case 'user': return <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">کاربران</span>;
      case 'order': return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">مالی و سفارش</span>;
      case 'settlement': return <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-bold">تسویه‌حساب</span>;
      case 'security': return <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold">امنیتی</span>;
      case 'notification': return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">اعلان سراسری</span>;
      default: return <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-700 text-[10px] font-bold">سیستمی</span>;
    }
  };

  const getStatusIcon = (st: string) => {
    if (st === 'success') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (st === 'failure') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">لاگ‌های امنیتی و رویدادهای سیستم (Audit Trail)</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">مشاهده تمام ردپاهای عملیاتی، فعالیت مدیران، تغییرات وضعیت‌ها و لاگین‌ها</p>
          </div>
        </div>

        <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl font-bold">
          مجموع رویدادهای ثبت‌شده: {total.toLocaleString('fa-IR')}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="جستجو در عنوان عملیات، ایمیل یا نام مدیر..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          >
            <option value="all">همه دسته‌ها</option>
            <option value="auth">احراز هویت</option>
            <option value="course">دوره‌ها</option>
            <option value="user">کاربران</option>
            <option value="order">سفارش و مالی</option>
            <option value="settlement">تسویه‌حساب</option>
            <option value="security">امنیتی</option>
            <option value="notification">اعلان‌ها</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="success">موفق (Success)</option>
            <option value="failure">ناموفق (Failure)</option>
            <option value="warning">هشدار (Warning)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">هیچ لاگ یا رویدادی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5">عنوان عملیات</th>
                  <th className="p-3.5">دسته‌بندی</th>
                  <th className="p-3.5">کاربر / مدیر مسئول</th>
                  <th className="p-3.5">جزئیات / پارامترها</th>
                  <th className="p-3.5">آدرس IP</th>
                  <th className="p-3.5">زمان ثبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log: any) => {
                  const user = log.userId;
                  const userName = user 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
                    : log.userName || log.userEmail || 'سیستم';

                  return (
                    <tr key={log._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center justify-center">
                          {getStatusIcon(log.status)}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {log.action}
                      </td>
                      <td className="p-3.5">
                        {getCategoryBadge(log.category)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-gray-800">{userName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{user?.role || log.userEmail || '-'}</div>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-gray-600 font-mono text-[11px]" title={JSON.stringify(log.details)}>
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                      <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                        {log.ip || '127.0.0.1'}
                      </td>
                      <td className="p-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('fa-IR')}
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
          <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-xs">
            <span className="text-gray-500">
              صفحه {page} از {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-gray-200 rounded-lg disabled:opacity-50 font-bold"
              >
                قبلی
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-lg disabled:opacity-50 font-bold"
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
