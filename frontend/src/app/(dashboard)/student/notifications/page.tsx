'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { Bell, CheckCircle2, Loader2, BookOpen, CreditCard, Video, FileText, CheckSquare, Settings } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data)
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    }
  });

  const notifications = notificationsData || [];
  
  const filteredNotifications = notifications.filter((notif: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.readAt;
    return true;
  });

  const handleNotificationClick = (notif: any) => {
    if (!notif.readAt) {
      markReadMutation.mutate(notif._id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'class': return <Video className="w-5 h-5 text-purple-500" />;
      case 'assignment': return <FileText className="w-5 h-5 text-amber-500" />;
      case 'quiz': return <CheckSquare className="w-5 h-5 text-rose-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getLink = (notif: any) => {
    if (notif.data?.courseId) return `/courses/${notif.data.courseId}`;
    if (notif.data?.assignmentId) return `/student/assignments/${notif.data.assignmentId}`;
    if (notif.data?.quizId) return `/student/quizzes/${notif.data.quizId}`;
    if (notif.data?.orderId) return `/student/orders/${notif.data.orderId}`;
    return null;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-500" />
            اعلان‌ها
          </h1>
          <p className="text-gray-500">مشاهده و مدیریت پیام‌های سیستم.</p>
        </div>
        <button 
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending || notifications.every((n: any) => n.readAt)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition disabled:opacity-50 text-sm"
        >
          {markAllReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          همه را خوانده‌ام
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          همه اعلان‌ها
        </button>
        <button onClick={() => setFilter('unread')} className={`px-4 py-2 text-sm font-bold rounded-full transition-colors flex items-center gap-2 ${filter === 'unread' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          خوانده نشده
          {notifications.filter((n: any) => !n.readAt).length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === 'unread' ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'}`}>
              {notifications.filter((n: any) => !n.readAt).length}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری اعلان‌ها...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Bell className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">اعلان جدیدی ندارید</h3>
          <p className="text-gray-500 max-w-sm mx-auto">در حال حاضر پیام یا اعلان بررسی نشده‌ای برای شما وجود ندارد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {filteredNotifications.map((notif: any) => {
            const isUnread = !notif.readAt;
            const link = getLink(notif);
            
            const content = (
              <div className={`p-6 flex items-start gap-4 transition-colors ${isUnread ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isUnread ? 'bg-white border-2 border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className={`font-bold text-base ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                    {notif.message}
                  </p>
                </div>
                {isUnread && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 shrink-0 shadow-sm shadow-blue-500/50"></div>
                )}
              </div>
            );

            return link ? (
              <Link href={link} key={notif._id} onClick={() => handleNotificationClick(notif)} className="block">
                {content}
              </Link>
            ) : (
              <div key={notif._id} onClick={() => handleNotificationClick(notif)} className="cursor-pointer">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
