'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  History, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, AlertTriangle, User, Globe, Loader2, ArrowUpDown,
  Laptop, Smartphone, Monitor, BookOpen, GraduationCap,
  Award, Wallet, DollarSign, Calendar, Eye, Download,
  RefreshCw, CheckCircle2, ShieldCheck, Clock, Layers,
  ChevronLeft, ChevronRight, X, FileText, Info
} from 'lucide-react';
import { PersianDatePicker } from '@/components/ui/PersianDatePicker';
import { toEnDigits } from '@/lib/utils';

export default function AuditLogsPage() {
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Fetch Live Audit Stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['auditStats'],
    queryFn: async () => {
      const res = await superAdminApi.getAuditStats();
      return res?.data || res || {};
    },
    refetchInterval: 30000 // auto-refresh every 30s
  });

  // Fetch Audit Logs with filters
  const { data: resData, isLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['auditLogs', roleFilter, category, status, severity, search, startDate, endDate, page],
    queryFn: async () => {
      const res = await superAdminApi.getAuditLogs({ 
        role: roleFilter,
        category, 
        status, 
        severity,
        search, 
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page, 
        limit: 20 
      });
      return res?.data || res || {};
    }
  });

  const logs = resData?.logs || [];
  const total = resData?.total || 0;
  const totalPages = resData?.totalPages || 1;

  const handleRefresh = () => {
    refetchStats();
    refetchLogs();
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <User className="w-3 h-3" />
            دانشجو
          </span>
        );
      case 'instructor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <GraduationCap className="w-3 h-3" />
            استاد
          </span>
        );
      case 'admin':
      case 'super-admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
            <ShieldCheck className="w-3 h-3" />
            مدیر سیستم
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-[11px] font-medium">
            مهمان / سیستم
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'auth':
        return <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-100">احراز هویت و ورود</span>;
      case 'assignment':
        return <span className="px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-100">تکالیف و ارزیابی</span>;
      case 'quiz':
        return <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">آزمون‌ها و کوئیز</span>;
      case 'course':
        return <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">دوره‌ها و محتوا</span>;
      case 'class':
        return <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">کلاس و جلسات</span>;
      case 'wallet':
        return <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">کیف پول و تسویه</span>;
      case 'order':
      case 'payment':
        return <span className="px-2.5 py-0.5 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold border border-green-100">خرید و پرداخت</span>;
      case 'support':
        return <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-100">پشتیبانی و تیکت</span>;
      case 'security':
        return <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">امنیتی و دسترسی</span>;
      case 'referral':
        return <span className="px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-100">معرف و پاداش</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold">سیستمی</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            موفق
          </span>
        );
      case 'failure':
        return (
          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-xs">
            <XCircle className="w-3.5 h-3.5" />
            ناموفق
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            هشدار
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-xs">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">سامانه پیشرفته ثبت و پایش رویدادها (Audit Trail & Activity Log)</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              رصد و رهگیری بلادرنگ تمامی اقدامات دانشجویان، اساتید و مدیران (آزمون‌ها، تکالیف، پرداخت‌ها، کلاس‌ها و امنیت)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="به‌روزرسانی لحظه‌ای لاگ‌ها"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">بروزرسانی</span>
          </button>

          <button
            onClick={exportLogsAsJson}
            disabled={logs.length === 0}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            خروجی JSON
          </button>
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">کل فعالیت‌های ۲۴ ساعت گذشته</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {(statsData?.logs24h || 0).toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              از مجموع {(statsData?.totalLogs || total).toLocaleString('fa-IR')} رویداد کل
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">اقدامات دانشجویان (امروز)</div>
            <div className="text-xl font-black text-indigo-600 mt-0.5 font-mono">
              {(statsData?.studentActions24h || 0).toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">آزمون، پاسخ تکلیف، ثبت‌نام و خرید</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">اقدامات اساتید (امروز)</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5 font-mono">
              {(statsData?.instructorActions24h || 0).toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">نمره‌دهی، ایجاد آزمون، کلاس و تسویه</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">هشدارهای امنیتی و خطاها</div>
            <div className="text-xl font-black text-rose-600 mt-0.5 font-mono">
              {((statsData?.securityWarnings24h || 0) + (statsData?.failures24h || 0)).toLocaleString('fa-IR')}
            </div>
            <div className="text-[11px] text-rose-500 mt-0.5 font-medium">خطاهای ورود یا تلاش ناموفق</div>
          </div>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
        <span className="text-xs font-bold text-slate-400 px-3">تفکیک نقش کاربر:</span>
        {[
          { id: 'all', label: 'همه نقش‌ها' },
          { id: 'student', label: '🎓 فقط دانشجویان' },
          { id: 'instructor', label: '👨‍🏫 فقط اساتید' },
          { id: 'admin', label: '🛡️ مدیران سیستم' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setRoleFilter(tab.id as any); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              roleFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در عنوان رویداد، نام یا ایمیل کاربر، IP..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-700"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              <option value="assignment">📝 تکالیف (ارسال و تصحیح)</option>
              <option value="quiz">🎯 آزمون‌ها (طراحی و شرکت در کوئیز)</option>
              <option value="class">🏫 کلاس‌ها (ثبت‌نام و حضورغیاب)</option>
              <option value="course">📚 دوره‌ها (ایجاد و سرفصل‌ها)</option>
              <option value="wallet">💳 کیف پول و تسویه حساب</option>
              <option value="order">🛍️ سفارش و پرداخت</option>
              <option value="auth">🔐 ورود و احراز هویت</option>
              <option value="support">💬 تیکت‌های پشتیبانی</option>
              <option value="security">🛡️ هشدارهای امنیتی</option>
              <option value="referral">🤝 سیستم دعوت و بازاریابی</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-700"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="success">✅ فقط عملیات‌های موفق</option>
              <option value="failure">❌ فقط عملیات‌های ناموفق</option>
              <option value="warning">⚠️ هشدارهای نیازمند بررسی</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-700"
            >
              <option value="all">سطح اهمیت (همه سطوح)</option>
              <option value="info">اطلاعاتی (Normal)</option>
              <option value="warning">هشدار (Warning)</option>
              <option value="critical">بحرانی و امنیتی (Critical)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Row with PersianDatePicker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <PersianDatePicker
              label="از تاریخ (شمسی):"
              value={startDate}
              onChange={(val) => { setStartDate(val); setPage(1); }}
              placeholder="انتخاب تاریخ شروع..."
            />
          </div>
          <div>
            <PersianDatePicker
              label="تا تاریخ (شمسی):"
              value={endDate}
              onChange={(val) => { setEndDate(val); setPage(1); }}
              placeholder="انتخاب تاریخ پایان..."
            />
          </div>
          <div className="flex items-end">
            {(startDate || endDate || search || category !== 'all' || status !== 'all' || severity !== 'all' || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setRoleFilter('all');
                  setCategory('all');
                  setStatus('all');
                  setSeverity('all');
                  setSearch('');
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
                className="w-full py-2.5 px-4 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                پاک‌سازی همه فیلترها
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-bold">در حال بارگذاری لاگ‌های جامع سامانه...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <History className="w-14 h-14 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-base text-slate-800">هیچ رویدادی با این شرایط یافت نشد</h3>
            <p className="text-xs text-slate-400 mt-1">فیلترهای اعمال‌شده را تغییر دهید یا واژه جستجو را بررسی نمایید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">شرح رویداد</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">کاربر مجری</th>
                  <th className="p-4">نقش کاربر</th>
                  <th className="p-4">دستگاه و IP</th>
                  <th className="p-4">زمان وقوع</th>
                  <th className="p-4 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any) => {
                  const user = log.userId;
                  const userName = user 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
                    : log.userName || log.userEmail || (log.details?.userEmail || 'کاربر ناشناس');

                  const userRole = log.userRole || user?.role || 'guest';
                  const isMobile = log.device === 'موبایل' || log.device === 'تبلت';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      
                      <td className="p-4 max-w-sm">
                        <div className="font-bold text-slate-900 leading-snug">
                          {log.title || log.action}
                        </div>
                        {log.targetTitle && (
                          <div className="text-[11px] text-indigo-600 mt-0.5 truncate font-medium">
                            هدف: {log.targetTitle}
                          </div>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {user?.email || log.userEmail || '-'}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {getRoleBadge(userRole)}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {isMobile ? <Smartphone className="w-3.5 h-3.5 text-blue-500" /> : <Monitor className="w-3.5 h-3.5 text-purple-500" />}
                          <span className="font-medium text-[11px]">{log.device || 'دسکتاپ'}</span>
                          <span className="text-[10px] text-slate-400">({log.browser || 'مرورگر'})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5" dir="ltr">
                          {log.ip || '127.0.0.1'}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap text-slate-500">
                        <div className="font-medium text-[11px]">
                          {new Date(log.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition flex items-center gap-1 mx-auto"
                          title="مشاهده متادیتا و جزئیات کامل لاگ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/60 text-xs gap-3">
            <span className="text-slate-500 font-medium">
              صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')} (مجموع {total.toLocaleString('fa-IR')} رویداد)
            </span>
            <div className="flex gap-1.5 items-center">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
                قبلی
              </button>

              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black rounded-xl">
                {page}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs"
              >
                بعدی
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">شناسنامه و متادیتای کامل رویداد</h3>
                  <p className="text-xs text-slate-400 font-mono">شناسه: {selectedLog._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Event Summary Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 text-sm">{selectedLog.title || selectedLog.action}</span>
                  {getStatusBadge(selectedLog.status)}
                </div>
                <div className="text-indigo-700 text-xs font-mono">کد اکشن: {selectedLog.action}</div>
              </div>

              {/* Actor & Role Info */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">کاربر انجام‌دهنده:</span>
                  <span className="font-black text-slate-800 text-sm">
                    {selectedLog.userId 
                      ? `${selectedLog.userId.firstName || ''} ${selectedLog.userId.lastName || ''}`.trim() || selectedLog.userId.email
                      : selectedLog.userName || selectedLog.userEmail || 'ناشناس'}
                  </span>
                  <div className="text-slate-400 font-mono text-[10px] mt-0.5">
                    {selectedLog.userEmail || selectedLog.userId?.email || '-'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] mb-1">نقش و سطح دسترسی:</span>
                  <div>{getRoleBadge(selectedLog.userRole || selectedLog.userId?.role)}</div>
                </div>
              </div>

              {/* Device & Network Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-500" />
                  اطلاعات شبکه، کلاینت و موقعیت
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">آدرس IP:</span>
                    <span className="font-bold text-slate-800">{selectedLog.ip || '127.0.0.1'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">نوع دستگاه:</span>
                    <span className="font-bold text-slate-800">{selectedLog.device || 'دسکتاپ'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">مرورگر:</span>
                    <span className="font-bold text-slate-800">{selectedLog.browser || 'Web'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">سیستم‌عامل:</span>
                    <span className="font-bold text-slate-800">{selectedLog.os || 'OS'}</span>
                  </div>
                </div>
              </div>

              {/* Payload / Details JSON */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  متادیتای ذخیره‌شده رویداد (JSON Payload):
                </h4>
                <pre 
                  dir="ltr" 
                  className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800 shadow-inner"
                >
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              {/* Timestamp */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>زمان ثبت در پایگاه داده:</span>
                <span className="font-mono text-slate-600">
                  {new Date(selectedLog.createdAt).toLocaleString('fa-IR')} ({new Date(selectedLog.createdAt).toISOString()})
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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
