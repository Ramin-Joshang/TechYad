'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { Bell, CheckCircle2, Loader2, BookOpen, CreditCard, Video, FileText, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export function NotificationDropdown({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data),
    refetchInterval: 30000 // Refetch every 30s for real-time feel
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    }
  });

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'course': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'class': return <Video className="w-4 h-4 text-purple-500" />;
      case 'assignment': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'quiz': return <CheckSquare className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRolePrefix = () => {
    return role === 'super-admin' || role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/student';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-sm text-gray-900">اعلان‌های اخیر</h3>
            <Link 
              href={`${getRolePrefix()}/notifications`} 
              onClick={() => setIsOpen(false)} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              مشاهده همه
            </Link>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs font-medium text-gray-500">در حال دریافت...</span>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 5).map((notif: any) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 hover:bg-gray-50 transition flex gap-3 relative group ${notif.readAt ? 'opacity-70' : 'bg-blue-50/30'}`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 mb-1">{notif.title}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">{notif.message}</p>
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(notif.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    {!notif.readAt && (
                      <button
                        onClick={() => markReadMutation.mutate(notif._id)}
                        disabled={markReadMutation.isPending}
                        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition p-1.5 bg-white shadow-sm border border-gray-100 rounded-full text-blue-600 hover:bg-blue-50"
                        title="علامت زدن به عنوان خوانده شده"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-500">
                  هیچ اعلانی ندارید
                </div>
              </div>
            )}
          </div>
          
          {notifications.length > 5 && (
            <Link 
              href={`${getRolePrefix()}/notifications`} 
              onClick={() => setIsOpen(false)} 
              className="block p-3 text-center text-xs font-bold text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition"
            >
              مشاهده {notifications.length - 5} اعلان دیگر
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
