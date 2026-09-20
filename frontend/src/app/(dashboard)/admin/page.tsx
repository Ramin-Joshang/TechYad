'use client';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { adminApi } from '@/features/admin/api/admin.api';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, BookOpen, DollarSign, Activity, CheckSquare, 
  List, GraduationCap, Briefcase, Video, Ticket, Shield, Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminApi.getDashboardStats().then((res: any) => res.data)
  });

  if (isLoading || !statsData) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" /></div>;
  }

  
  const primaryStats = [
    { label: 'کل کاربران', value: (statsData?.totalUsers || 0).toLocaleString(), icon: Users, color: 'bg-[var(--neo-primary)]', link: '/admin/users' },
    { label: 'درآمد کل (تومان)', value: (statsData?.totalRevenue || 0).toLocaleString(), icon: DollarSign, color: 'bg-emerald-500', link: '/admin/revenue' },
    { label: 'کل دوره‌ها', value: (statsData?.totalCourses || 0), icon: BookOpen, color: 'bg-purple-500', link: '/admin/courses' },
    { label: 'سفارشات موفق', value: (statsData?.activeOrders || 0).toLocaleString(), icon: List, color: 'bg-amber-500', link: '/admin/orders' },
  ];

  const entityStats = [
    { label: 'دانشجویان', value: (statsData?.students || 0).toLocaleString(), icon: GraduationCap, color: 'text-[var(--neo-primary)] bg-[var(--neo-primary)]/10', link: '/admin/students' },
    { label: 'اساتید', value: (statsData?.instructors || 0), icon: Briefcase, color: 'text-[var(--neo-primary)] bg-[var(--neo-primary)]/10', link: '/admin/instructors' },
    { label: 'کلاس‌های فعال', value: (statsData?.classes || 0), icon: Video, color: 'text-emerald-600 bg-emerald-50', link: '/admin/classes' },
    { label: 'تیکت‌های باز', value: (statsData?.tickets || 0), icon: Ticket, color: 'text-rose-600 bg-rose-50', link: '/admin/tickets' },
  ];

  const courseStats = [
    { label: 'دوره‌های منتشر شده', value: (statsData?.publishedCourses || 0), icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/courses/published' },
    { label: 'دوره‌های در انتظار تایید', value: (statsData?.pendingCourses || 0), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/courses/pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neo-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--neo-secondary)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[var(--neo-primary)]" />
            <h1 className="text-3xl font-black text-[var(--neo-text-main)]">پنل مدیریت تک‌یاد</h1>
          </div>
          <p className="text-[var(--neo-text-secondary)] text-lg">سلام {user?.firstName}، سیستم در وضعیت پایداری قرار دارد.</p>
        </div>
        
        <div className="relative z-10 shrink-0 flex gap-4">
          <Link href="/admin/courses/pending" className="px-6 py-4 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2">
            <Activity className="w-5 h-5" />
            بررسی دوره‌ها
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={i} className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] hover:shadow-md hover:border-[var(--neo-primary)]/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl text-white shadow-lg ${stat.color} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-black text-[var(--neo-text-main)] mb-1">{stat.value}</div>
              <h3 className="text-[var(--neo-text-secondary)] font-medium">{stat.label}</h3>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Entities Management */}
        <div className="lg:col-span-2 bg-[var(--neo-surface)] rounded-3xl p-8 shadow-sm border border-[var(--neo-border)]">
          <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6">آمار موجودیت‌ها</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entityStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Link href={stat.link} key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--neo-border)] hover:border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] transition-colors group">
                  <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[var(--neo-text-main)]">{stat.value}</div>
                    <div className="text-sm font-medium text-[var(--neo-text-secondary)]">{stat.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Status */}
        <div className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-3xl p-8 shadow-sm border border-[var(--neo-border)] h-full flex flex-col">
            <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6">وضعیت دوره‌ها</h2>
            <div className="space-y-4 flex-1">
              {courseStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Link href={stat.link} key={i} className={`flex items-center justify-between p-5 rounded-2xl border border-transparent hover:border-[var(--neo-border)] transition-colors ${stat.bg}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-[var(--neo-surface)]/50 backdrop-blur ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-bold ${stat.color}`}>{stat.label}</span>
                    </div>
                    <span className="text-2xl font-black text-[var(--neo-text-main)]">{stat.value}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
