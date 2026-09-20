'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  BookOpen, Users, DollarSign, BarChart, Video, 
  FileText, Activity, CheckSquare, TrendingUp, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { api } from '@/lib/api';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  
  const { data: earningsData } = useQuery({
    queryKey: ['instructor-earnings'],
    queryFn: () => coursesApi.getInstructorStats().then(res => res.data)
  });
  
  const { data: upcomingClasses } = useQuery({
    queryKey: ['instructor-upcoming-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data)
  });

  const stats = {
    totalCourses: earningsData?.totalCourses || 0,
    totalStudents: earningsData?.totalStudents || 0,
    totalSales: earningsData?.totalRevenue || 0,
    monthlySales: earningsData?.monthlyRevenue || 0,
    classes: earningsData?.activeClasses || 0,
    drafts: earningsData?.drafts || 0,
    pending: earningsData?.pending || 0,
    published: earningsData?.publishedCourses || 0
  };

  const primaryStats = [
    { label: 'دانشجویان شما', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'bg-[var(--neo-primary)]' },
    { label: 'فروش کل (تومان)', value: stats.totalSales.toLocaleString(), icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'فروش این ماه', value: stats.monthlySales.toLocaleString(), icon: TrendingUp, color: 'bg-amber-500' },
    { label: 'دوره‌های شما', value: stats.totalCourses, icon: BookOpen, color: 'bg-purple-500' },
  ];

  const secondaryStats = [
    { label: 'دوره‌های منتشر شده', value: stats.published, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'دوره‌های در انتظار تایید', value: stats.pending, icon: Activity, color: 'text-amber-600 bg-amber-50' },
    { label: 'دوره‌های پیش‌نویس', value: stats.drafts, icon: FileText, color: 'text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]' },
    { label: 'کلاس‌های فعال', value: stats.classes, icon: Video, color: 'text-[var(--neo-primary)] bg-[var(--neo-primary)]/10' },
  ];

  const activeLiveClasses = upcomingClasses?.filter((c: any) => c.status === 'published')?.slice(0, 3) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-[var(--neo-surface)] rounded-3xl p-8 shadow-sm border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[var(--neo-text-main)] mb-2">سلام استاد {user?.lastName || user?.firstName}! 🎓</h1>
          <p className="text-[var(--neo-text-secondary)] text-lg">به پنل مدیریت آموزشی خود خوش آمدید. آمار دوره‌های شما در دسترس است.</p>
        </div>
        <div className="relative z-10 shrink-0">
          <Link href="/instructor/courses/new" className="px-6 py-4 bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white rounded-2xl font-bold shadow-xl shadow-[var(--neo-primary)]/20 transition-all flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            ایجاد دوره جدید
          </Link>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-black text-[var(--neo-text-main)] mb-1">{stat.value}</div>
              <h3 className="text-[var(--neo-text-secondary)] font-medium">{stat.label}</h3>
            </div>
          )
        })}
      </div>

      {/* Secondary Stats & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Content Status */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-8 shadow-sm border border-[var(--neo-border)]">
          <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--neo-text-muted)]" />
            وضعیت محتواها
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {secondaryStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--neo-border)] hover:border-[var(--neo-border)] transition-colors">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[var(--neo-text-main)]">{stat.value}</div>
                    <div className="text-sm font-medium text-[var(--neo-text-secondary)]">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Classes Schedule */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-8 shadow-sm border border-[var(--neo-border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[var(--neo-primary)]" />
              برنامه کلاس‌های آینده
            </h2>
            <Link href="/instructor/classes" className="text-sm font-bold text-[var(--neo-primary)] hover:text-[var(--neo-primary)]">مشاهده همه</Link>
          </div>
          
          <div className="space-y-4">
            {activeLiveClasses.length === 0 ? (
              <div className="text-center py-8 text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] rounded-2xl border border-dashed border-[var(--neo-border)]">
                هیچ کلاس زنده‌ای ندارید.
              </div>
            ) : (
              activeLiveClasses.map((cls: any) => {
                const date = new Date(cls.startDate);
                const day = date.getDate();
                const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
                const time = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={cls._id} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
                    <div className="w-14 h-14 bg-[var(--neo-surface)] rounded-xl shadow-sm border border-[var(--neo-border)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-red-500">{monthName}</span>
                      <span className="text-lg font-black text-[var(--neo-text-main)]">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--neo-text-main)] truncate">{cls.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-[var(--neo-text-secondary)] mt-1">
                        <Video className="w-3 h-3" />
                        <span>ساعت {time}</span>
                      </div>
                    </div>
                    {cls.meetingLink && (
                      <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-100 text-[var(--neo-primary)] font-bold text-sm rounded-xl hover:bg-blue-200 transition-colors">
                        ورود
                      </a>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
