'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { 
  Bell, CheckCircle2, Loader2, BookOpen, CreditCard, Video, 
  FileText, CheckSquare, Volume2, VolumeX, Sparkles, X
} from 'lucide-react';
import Link from 'next/link';

// Elegant two-tone notification sound synthesizer using Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Tone 2: 880 Hz (A5) with slight delay
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Audio context may be restricted before first gesture
  }
}

export function NotificationDropdown({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadCountRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if clicked outside mobile portal
        const target = event.target as HTMLElement;
        if (!target.closest?.('#mobile-notification-modal')) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data),
    refetchInterval: 12000 // Poll every 12 seconds for real-time alerts
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
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  // Sound & blinking trigger on new unread notifications
  useEffect(() => {
    if (prevUnreadCountRef.current !== null && unreadCount > prevUnreadCountRef.current) {
      if (soundEnabled) {
        playNotificationChime();
      }
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, soundEnabled]);
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'course': 
      case 'enrollment': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'payment': 
      case 'sale': return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'class': return <Video className="w-4 h-4 text-purple-500" />;
      case 'assignment': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'quiz': return <CheckSquare className="w-4 h-4 text-rose-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRolePrefix = () => {
    return role === 'super-admin' || role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/student';
  };

  // Reusable notification list content
  const renderContent = (isMobileView = false) => (
    <>
      <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-xs sm:text-sm text-slate-900">اعلان‌های اخیر</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-mono">
              {unreadCount} جدید
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playNotificationChime();
            }}
            className={`p-1.5 rounded-xl border transition ${
              soundEnabled ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={soundEnabled ? 'صدا فعال است (کلیک برای بی‌صدا)' : 'صدا غیرفعال است (کلیک برای فعال‌سازی)'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <Link 
            href={`${getRolePrefix()}/notifications`} 
            onClick={() => setIsOpen(false)} 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition px-1"
          >
            مشاهده همه
          </Link>

          {isMobileView && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    
      <div className="max-h-[340px] sm:max-h-[360px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-3">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs font-medium text-slate-400">در حال دریافت اعلان‌ها...</span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 6).map((notif: any) => {
            const isUnread = !notif.readAt;
            return (
              <div 
                key={notif._id} 
                className={`p-3 sm:p-3.5 hover:bg-slate-50 transition flex gap-3 relative group ${
                  isUnread ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                  isUnread ? 'bg-white border-indigo-200 shadow-2xs' : 'bg-slate-50 border-slate-200'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {isUnread && (
                  <button
                    onClick={() => markReadMutation.mutate(notif._id)}
                    className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition shrink-0 self-center"
                    title="علامت‌گذاری به عنوان خوانده‌شده"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            هیچ اعلان جدیدی وجود ندارد.
          </div>
        )}
      </div>

      {unreadCount > 0 && (
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/60 text-center">
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            علامت‌گذاری همه به عنوان خوانده‌شده
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 sm:p-2.5 rounded-2xl relative transition-all duration-300 ${
          unreadCount > 0 
            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 ring-2 ring-amber-300 ring-offset-1' 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title={unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'اعلان‌ها'}
        aria-label="اعلان‌ها"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-[bounce_2s_infinite] text-amber-600' : ''}`} />
        
        {/* Pulsing Blinking Dot Indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-600 text-white text-[10px] font-black items-center justify-center border-2 border-white shadow-xs font-mono">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Desktop Dropdown (md and above): clean relative dropdown below the bell icon */}
          <div className="hidden md:block absolute top-12 left-0 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            {renderContent(false)}
          </div>

          {/* Mobile & Small Tablet Modal (below md): Portaled directly to document.body so it NEVER overflows or gets clipped by backdrop-filter or overflow-hidden */}
          {mounted && createPortal(
            <div id="mobile-notification-modal" className="md:hidden">
              <div 
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[99998] transition-opacity" 
                onClick={() => setIsOpen(false)} 
              />
              <div className="fixed top-16 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:w-full max-w-sm sm:max-w-md mx-auto z-[99999] bg-white rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden max-h-[calc(100vh-5rem)] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {renderContent(true)}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
