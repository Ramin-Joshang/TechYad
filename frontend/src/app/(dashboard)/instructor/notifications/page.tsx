'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { 
  Bell, CheckCircle2, Loader2, BookOpen, CreditCard, Video, 
  FileText, CheckSquare, MessageSquare, DollarSign, Users, 
  Trash2, ExternalLink, Filter, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function InstructorNotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'enrollment' | 'assignment' | 'comment' | 'financial'>('all');

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data),
    refetchInterval: 15000 // auto poll every 15s
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

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  const filteredNotifications = notifications.filter((notif: any) => {
    if (filter === 'unread') return !notif.readAt;
    if (filter === 'enrollment') return notif.type === 'enrollment' || notif.type === 'class' || notif.type === 'course';
    if (filter === 'assignment') return notif.type === 'assignment' || notif.type === 'quiz';
    if (filter === 'comment') return notif.type === 'comment' || notif.type === 'review';
    if (filter === 'financial') return notif.type === 'payment' || notif.type === 'sale' || notif.type === 'settlement';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': 
      case 'enrollment': return <Users className="w-5 h-5 text-blue-600" />;
      case 'class': return <Video className="w-5 h-5 text-purple-600" />;
      case 'payment': 
      case 'sale':
      case 'settlement': return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'assignment': return <FileText className="w-5 h-5 text-amber-600" />;
      case 'quiz': return <CheckSquare className="w-5 h-5 text-rose-600" />;
      case 'comment':
      case 'review': return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      default: return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTargetLink = (notif: any) => {
    if (notif.data?.classId) return '/instructor/students';
    if (notif.data?.courseId) return `/instructor/students?course=${notif.data.courseId}`;
    if (notif.data?.submissionId || notif.type === 'assignment') return '/instructor/assignments';
    if (notif.data?.quizId || notif.type === 'quiz') return '/instructor/quizzes';
    if (notif.type === 'sale' || notif.type === 'payment') return '/instructor/sales';
    if (notif.type === 'settlement') return '/instructor/wallet';
    if (notif.type === 'comment' || notif.type === 'review') return '/instructor/comments';
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">اعلان‌ها و پیام‌های سیستم</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                اطلاع‌رسانی‌های ثبت‌نام دانشجویان، ارسال تکالیف، نظرات جدید و واریزی‌های درآمد
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-40"
          >
            {markAllReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            علامت‌گذاری همه به عنوان خوانده‌شده
          </button>
        </div>
      </div>

      {/* Stats and Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'همه اعلان‌ها', count: notifications.length },
            { id: 'unread', label: 'خوانده‌نشده', count: unreadCount },
            { id: 'enrollment', label: '👥 ثبت‌نام‌ها' },
            { id: 'assignment', label: '📝 تکالیف و آزمون‌ها' },
            { id: 'financial', label: '💰 واریز و مالی' },
            { id: 'comment', label: '💬 نظرات و پرسش‌ها' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-16 rounded-3xl border border-[var(--neo-border)] flex flex-col items-center justify-center text-indigo-600 gap-3">
            <Loader2 className="w-9 h-9 animate-spin" />
            <span className="text-xs font-bold text-slate-400">در حال دریافت اعلان‌ها...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-[var(--neo-border)] text-center text-slate-500 space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-800">هیچ اعلانی در این دسته یافت نشد</h3>
            <p className="text-xs text-slate-400">پیام‌های جدید ثبت‌نام یا تکالیف به محض ثبت در اینجا نمایش داده می‌شوند.</p>
          </div>
        ) : (
          filteredNotifications.map((notif: any) => {
            const isUnread = !notif.readAt;
            const targetLink = getTargetLink(notif);

            return (
              <div
                key={notif._id}
                className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                  isUnread 
                    ? 'bg-indigo-50/40 border-indigo-200' 
                    : 'bg-white border-[var(--neo-border)] hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 ${
                    isUnread ? 'bg-white border-indigo-200 shadow-2xs' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900">
                        {notif.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>{new Date(notif.createdAt).toLocaleDateString('fa-IR')}</span>
                      <span>•</span>
                      <span>{new Date(notif.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  {targetLink && (
                    <Link
                      href={targetLink}
                      onClick={() => {
                        if (isUnread) markReadMutation.mutate(notif._id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs"
                    >
                      <span>مشاهده بخش مربوطه</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => markReadMutation.mutate(notif._id)}
                      disabled={markReadMutation.isPending}
                      className="p-2 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition"
                      title="علامت‌گذاری به عنوان خوانده شده"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
