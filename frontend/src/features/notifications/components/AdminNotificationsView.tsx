'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { 
  Bell, CheckCircle2, Loader2, BookOpen, CreditCard, Video, 
  FileText, CheckSquare, MessageSquare, DollarSign, Users, 
  Search, ShieldAlert, Sparkles, ChevronRight, ChevronLeft,
  Volume2, VolumeX, Check, ExternalLink, Inbox, Clock
} from 'lucide-react';
import Link from 'next/link';

interface AdminNotificationsViewProps {
  role: 'admin' | 'super-admin';
}

export default function AdminNotificationsView({ role }: AdminNotificationsViewProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'users' | 'courses' | 'orders' | 'security'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const itemsPerPage = 10;

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data),
    refetchInterval: 12000 // auto poll every 12s
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
    }
  });

  const notifications: any[] = notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;
  const readCount = notifications.filter((n: any) => !!n.readAt).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif: any) => {
      // Status filter
      if (filter === 'unread' && notif.readAt) return false;
      if (filter === 'read' && !notif.readAt) return false;
      
      // Category filter
      if (filter === 'users') {
        if (!['user', 'student', 'instructor', 'registration', 'profile'].includes(notif.type)) return false;
      } else if (filter === 'courses') {
        if (!['course', 'class', 'assignment', 'quiz', 'enrollment'].includes(notif.type)) return false;
      } else if (filter === 'orders') {
        if (!['order', 'payment', 'sale', 'settlement', 'wallet'].includes(notif.type)) return false;
      } else if (filter === 'security') {
        if (!['security', 'auth', 'login', 'system'].includes(notif.type)) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = notif.title?.toLowerCase().includes(q);
        const msgMatch = notif.message?.toLowerCase().includes(q);
        return titleMatch || msgMatch;
      }

      return true;
    });
  }, [notifications, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': 
      case 'enrollment': return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'class': return <Video className="w-5 h-5 text-purple-600" />;
      case 'payment': 
      case 'sale':
      case 'order':
      case 'settlement': return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'assignment': return <FileText className="w-5 h-5 text-amber-600" />;
      case 'quiz': return <CheckSquare className="w-5 h-5 text-rose-600" />;
      case 'comment':
      case 'review': return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'user':
      case 'student':
      case 'instructor': return <Users className="w-5 h-5 text-teal-600" />;
      case 'security':
      case 'auth': return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTargetLink = (notif: any) => {
    const prefix = role === 'super-admin' ? '/super-admin' : '/admin';
    if (notif.data?.courseId) return `${prefix}/courses`;
    if (notif.data?.classId) return `${prefix}/classes`;
    if (notif.data?.userId) return `${prefix}/users`;
    if (notif.data?.orderId || notif.type === 'order' || notif.type === 'payment') return `${prefix}/orders`;
    if (notif.data?.ticketId) return `${prefix}/tickets`;
    if (notif.type === 'security') return role === 'super-admin' ? '/super-admin/audit-logs' : '/admin/logs';
    if (notif.type === 'comment') return `${prefix}/comments`;
    if (notif.type === 'settlement') return `${prefix}/settlements`;
    return null;
  };

  const roleTitle = role === 'super-admin' ? 'مرکز اعلان‌ها و هشدارهای سوپرادمین' : 'مرکز اعلان‌ها و هشدارهای مدیریت';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{roleTitle}</h1>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono animate-pulse">
                  {unreadCount} جدید
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              مشاهده تمامی رویدادها، تراکنش‌ها، ثبت‌نام‌ها و هشدارهای امنیتی به تفکیک وضعیت
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Sound Notification Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition ${
              soundEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'هشدار صوتی فعال است' : 'هشدار صوتی غیرفعال است'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mark All Read Button */}
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            علامت‌گذاری همه به عنوان خوانده‌شده
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'همه اعلان‌ها', count: notifications.length },
              { id: 'unread', label: 'خوانده‌نشده', count: unreadCount, badgeClass: 'bg-rose-100 text-rose-700' },
              { id: 'read', label: 'خوانده‌شده', count: readCount, badgeClass: 'bg-slate-100 text-slate-700' },
              { id: 'orders', label: '💰 تراکنش و مالی' },
              { id: 'users', label: '👥 کاربران' },
              { id: 'courses', label: '📚 دوره‌ها و کلاس‌ها' },
              { id: 'security', label: '🛡️ رویدادهای امنیتی' },
            ].map(tab => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setFilter(tab.id as any); setCurrentPage(1); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-white/20 text-white' : (tab.badgeClass || 'bg-slate-200 text-slate-700')
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در متن یا عنوان اعلان..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">در حال دریافت اعلان‌ها...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-16 text-center">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">هیچ اعلانی یافت نشد</h3>
            <p className="text-xs text-slate-500 mt-1">با توجه به فیلتر و جستجوی شما اعلانی برای نمایش وجود ندارد.</p>
          </div>
        ) : (
          paginatedNotifications.map((notif: any) => {
            const isUnread = !notif.readAt;
            const targetLink = getTargetLink(notif);

            return (
              <div 
                key={notif._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnread 
                    ? 'bg-indigo-50/40 border-indigo-200/80 shadow-xs ring-1 ring-indigo-500/10' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Icon & Unread Indicator */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isUnread ? 'bg-indigo-100/80 shadow-xs' : 'bg-slate-100'
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-ping" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className={`text-sm font-black ${
                        isUnread ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {notif.title}
                      </h4>

                      {/* Status Badges */}
                      {isUnread ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          خوانده‌نشده
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-500" />
                          خوانده‌شده
                        </span>
                      )}

                      {/* Type Badge */}
                      <span className="text-[10px] text-slate-400 font-mono bg-white border border-slate-200 px-1.5 py-0.2 rounded-md">
                        {notif.type || 'system'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {notif.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notif.createdAt).toLocaleString('fa-IR')}
                      </span>
                      {notif.readAt && (
                        <span className="text-[10px] text-slate-400">
                          (خوانده شده در: {new Date(notif.readAt).toLocaleString('fa-IR')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {targetLink && (
                    <Link
                      href={targetLink}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      <span>بررسی در پنل</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => markReadMutation.mutate(notif._id)}
                      disabled={markReadMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition cursor-pointer border border-indigo-200/50"
                      title="تغییر وضعیت به خوانده‌شده"
                    >
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>خواندم</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} از {filteredNotifications.length} اعلان (صفحه {currentPage} از {totalPages})
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              title="صفحه قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-xl font-bold font-mono text-xs transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="text-slate-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              title="صفحه بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
