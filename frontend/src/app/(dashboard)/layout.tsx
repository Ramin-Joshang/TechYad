'use client';

import { NotificationDropdown } from './components/NotificationDropdown';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { AuthGuard } from '@/features/auth/components/guards/AuthGuard';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  BookOpen, LayoutDashboard, LogOut, UserCircle, 
  Settings, PlayCircle, BarChart, FileText, CheckSquare, MessageSquare,
  GraduationCap, CreditCard, Heart, Ticket, Bell,
  Users, DollarSign, List, Shield, Menu, X, Video, Activity,
  Briefcase, ChevronRight, ChevronLeft, ShieldAlert, Key, Tag,
  Send, MessageCircle, History, Lock, Wallet } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await superAdminApi.getPublicSettings();
      return res.data;
    },
    staleTime: 1000 * 60 * 10
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const getNavLinks = () => {
    const profileLink = { name: 'تنظیمات پروفایل', href: '/profile', icon: Settings };

    if (user?.role === 'super-admin') {
      return [
        { name: 'داشبورد کلان', href: '/super-admin', icon: LayoutDashboard },
        { name: 'مدیران و کارکنان', href: '/super-admin/admins', icon: ShieldAlert },
        { name: 'نقش‌ها و دسترسی‌ها', href: '/super-admin/roles', icon: Key },
        { name: 'کاربران', href: '/super-admin/users', icon: Users },
        { name: 'دانشجویان', href: '/super-admin/students', icon: GraduationCap },
        { name: 'اساتید', href: '/super-admin/instructors', icon: Briefcase },
        { name: 'تسویه‌حساب اساتید', href: '/super-admin/settlements', icon: Wallet },
        { name: 'دوره‌ها', href: '/super-admin/courses', icon: BookOpen },
        { name: 'مدیریت نظرات', href: '/super-admin/comments', icon: MessageCircle },
        { name: 'دسته‌بندی‌ها', href: '/super-admin/categories', icon: List },
        { name: 'کلاس‌ها', href: '/super-admin/classes', icon: Video },
        { name: 'سفارشات', href: '/super-admin/orders', icon: List },
        { name: 'تراکنش‌های مالی', href: '/super-admin/payments', icon: CreditCard },
        { name: 'کد تخفیف', href: '/super-admin/coupons', icon: Tag },
        { name: 'ارسال اعلان همگانی', href: '/super-admin/broadcast', icon: Send },
        { name: 'پشتیبانی', href: '/super-admin/tickets', icon: Ticket },
        { name: 'گزارش‌ها', href: '/super-admin/reports', icon: BarChart },
        { name: 'مدیریت وبلاگ', href: '/super-admin/blog', icon: FileText },
        { name: 'لاگ‌های امنیتی', href: '/super-admin/audit-logs', icon: History },
        { name: 'امنیت و کنترل دسترسی', href: '/super-admin/security', icon: Lock },
        { name: 'تنظیمات سیستم', href: '/super-admin/settings', icon: Settings },
        
        profileLink
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'داشبورد', href: '/admin', icon: LayoutDashboard },
        { name: 'مدیریت کاربران', href: '/admin/users', icon: Users },
        { name: 'دانشجویان', href: '/admin/students', icon: GraduationCap },
        { name: 'اساتید', href: '/admin/instructors', icon: Briefcase },
        { name: 'تسویه‌حساب اساتید', href: '/admin/settlements', icon: Wallet },
        { name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: List },
        { name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },
        { name: 'دوره‌های منتشر شده', href: '/admin/courses/published', icon: CheckSquare },
        { name: 'دوره‌های در انتظار', href: '/admin/courses/pending', icon: Activity },
        { name: 'مدیریت نظرات', href: '/admin/comments', icon: MessageCircle },
        { name: 'کلاس‌ها', href: '/admin/classes', icon: Video },
        { name: 'سفارشات', href: '/admin/orders', icon: List },
        { name: 'تراکنش‌های مالی', href: '/admin/payments', icon: CreditCard },
        { name: 'کد تخفیف', href: '/admin/coupons', icon: Tag },
        { name: 'تیکت‌های پشتیبانی', href: '/admin/tickets', icon: Ticket },
        { name: 'گزارش‌ها و آمار', href: '/admin/reports', icon: BarChart },
        { name: 'مدیریت وبلاگ', href: '/admin/blog', icon: FileText },
        { name: 'تنظیمات و برندینگ', href: '/admin/settings', icon: Settings },
        profileLink
      ];
    } else if (user?.role === 'instructor') {
      return [
        { name: 'داشبورد', href: '/instructor', icon: LayoutDashboard },
        { name: 'مدیریت دوره‌ها', href: '/instructor/courses', icon: BookOpen },
        { name: 'آزمون‌ها و کوییزها', href: '/instructor/quizzes', icon: CheckSquare },
        { name: 'تکالیف و پروژه‌ها', href: '/instructor/assignments', icon: FileText },
        { name: 'کلاس‌های زنده', href: '/instructor/classes', icon: Video },
        { name: 'دانشجویان من', href: '/instructor/students', icon: Users },
        { name: 'نظرات دانشجویان', href: '/instructor/comments', icon: MessageSquare },
        { name: 'مقالات وبلاگ', href: '/instructor/blog', icon: FileText },
        { name: 'گزارش مالی و فروش', href: '/instructor/sales', icon: DollarSign },
        profileLink
      ];
    } else {
      return [
        { name: 'داشبورد', href: '/student', icon: LayoutDashboard },
        { name: 'دوره‌های من', href: '/student/courses', icon: BookOpen },
        { name: 'کلاس‌های من', href: '/student/classes', icon: Video },
        { name: 'تکالیف', href: '/student/assignments', icon: FileText },
        { name: 'آزمون‌ها', href: '/student/quizzes', icon: CheckSquare },
        { name: 'پرداخت‌های من', href: '/student/orders', icon: CreditCard },
        { name: 'علاقه‌مندی‌ها', href: '/student/favorites', icon: Heart },
        { name: 'تیکت‌های پشتیبانی', href: '/student/support', icon: Ticket },
        { name: 'اعلان‌ها', href: '/student/notifications', icon: Bell },
        profileLink
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[var(--neo-bg)] overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-[var(--neo-surface)] border-l border-[var(--neo-border)] flex flex-col transform transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-[var(--neo-border)] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden" onClick={closeMenu}>
              {publicSettings?.siteLogo ? (
                <img 
                  src={publicSettings.siteLogo} 
                  alt={publicSettings?.siteName || 'لوگو'} 
                  className={`${isSidebarCollapsed ? 'w-8 h-8' : 'h-8 max-w-[130px]'} object-contain shrink-0`}
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <span className="font-bold text-xl text-[var(--neo-text-main)] tracking-tight truncate">
                  {publicSettings?.siteName ? publicSettings.siteName.split('|')[0].trim() : 'تک‌یاد'}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] p-1">
                {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <button onClick={closeMenu} className="lg:hidden text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className={`p-5 border-b border-[var(--neo-border)] flex items-center gap-4 bg-[var(--neo-bg)] ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className={`${isSidebarCollapsed ? 'w-10 h-10 rounded-xl text-lg' : 'w-12 h-12 rounded-2xl text-xl'} bg-[var(--neo-primary)]/20 text-[var(--neo-secondary)] flex items-center justify-center font-bold overflow-hidden shadow-inner shrink-0`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || 'U'
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[var(--neo-text-main)] truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs font-medium text-[var(--neo-secondary)] capitalize bg-[var(--neo-primary)]/10 inline-block px-2 py-0.5 rounded-full mt-1">
                  {user?.role === 'super-admin' || user?.role === 'admin' ? 'مدیریت' : user?.role === 'instructor' ? 'استاد' : 'دانشجو'}
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Strict exact match for root dashboard paths, partial for others
              const isActive = (link.href === '/student' || link.href === '/admin' || link.href === '/instructor' || link.href === '/super-admin')
                ? pathname === link.href
                : pathname.startsWith(link.href);
                
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  title={isSidebarCollapsed ? link.name : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-[var(--neo-primary)]/20' 
                      : 'text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--neo-text-muted)]'}`} />
                  {!isSidebarCollapsed && link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--neo-border)] bg-[var(--neo-bg)]">
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? 'خروج' : undefined}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && 'خروج از حساب'}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          {/* Mobile Header */}
          <header className="bg-[var(--neo-surface)] border-b border-[var(--neo-border)] h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] rounded-lg lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h2 className="font-bold text-[var(--neo-text-main)] text-lg">پنل کاربری {user?.role === 'super-admin' || user?.role === 'admin' ? 'مدیریت' : user?.role === 'instructor' ? 'اساتید' : 'دانشجویان'}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative">
<NotificationDropdown role={user?.role || 'student'} />

              <Link href="/profile" className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[var(--neo-border)] hover:bg-[var(--neo-bg)] transition cursor-pointer">
                <span className="text-sm font-medium text-[var(--neo-text-main)] hidden sm:block">{user?.firstName}</span>
                <div className="w-8 h-8 rounded-full bg-[var(--neo-primary)]/20 text-[var(--neo-secondary)] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.charAt(0) || 'U'
                  )}
                </div>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-[var(--neo-bg)] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
