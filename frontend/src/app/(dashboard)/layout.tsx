'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { AuthGuard } from '@/features/auth/components/guards/AuthGuard';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { useState } from 'react';
import {
  BookOpen, LayoutDashboard, LogOut, UserCircle, 
  Settings, PlayCircle, BarChart, FileText, CheckSquare,
  GraduationCap, CreditCard, Heart, Ticket, Bell,
  Users, DollarSign, List, Shield, Menu, X, Video, Activity,
  Briefcase
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    if (user?.role === 'super-admin' || user?.role === 'admin') {
      return [
        { name: 'داشبورد', href: '/admin', icon: LayoutDashboard },
        { name: 'مدیریت کاربران', href: '/admin/users', icon: Users },
        { name: 'دانشجویان', href: '/admin/students', icon: GraduationCap },
        { name: 'اساتید', href: '/admin/instructors', icon: Briefcase },
        { name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },
        { name: 'دوره‌های منتشر شده', href: '/admin/courses/published', icon: CheckSquare },
        { name: 'دوره‌های در انتظار', href: '/admin/courses/pending', icon: Activity },
        { name: 'کلاس‌ها', href: '/admin/classes', icon: Video },
        { name: 'سفارشات', href: '/admin/orders', icon: List },
        { name: 'درآمد و مالی', href: '/admin/revenue', icon: DollarSign },
        { name: 'تیکت‌های پشتیبانی', href: '/admin/tickets', icon: Ticket },
        profileLink
      ];
    } else if (user?.role === 'instructor') {
      return [
        { name: 'داشبورد', href: '/instructor', icon: LayoutDashboard },
        { name: 'دوره‌های منتشر شده', href: '/instructor/courses/published', icon: CheckSquare },
        { name: 'دوره‌های پیش‌نویس', href: '/instructor/courses/draft', icon: FileText },
        { name: 'دوره‌های در انتظار', href: '/instructor/courses/pending', icon: Activity },
        { name: 'کلاس‌های من', href: '/instructor/classes', icon: Video },
        { name: 'دانشجویان من', href: '/instructor/students', icon: Users },
        { name: 'فروش ماهانه', href: '/instructor/sales/monthly', icon: BarChart },
        { name: 'فروش کل', href: '/instructor/sales', icon: DollarSign },
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
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight" onClick={closeMenu}>
              Tech<span className="text-gray-900">Yad</span>
            </Link>
            <button onClick={closeMenu} className="lg:hidden text-gray-500 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl overflow-hidden shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs font-medium text-blue-600 capitalize bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1">
                {user?.role === 'super-admin' || user?.role === 'admin' ? 'مدیریت' : user?.role === 'instructor' ? 'استاد' : 'دانشجو'}
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Strict exact match for root dashboard paths, partial for others
              const isActive = (link.href === '/student' || link.href === '/admin' || link.href === '/instructor')
                ? pathname === link.href
                : pathname.startsWith(link.href);
                
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-right"
            >
              <LogOut className="w-5 h-5" />
              خروج از حساب
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          {/* Mobile Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-gray-900">پنل کاربری</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || 'U'
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
