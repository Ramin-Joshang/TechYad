'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  BookOpen, Users, DollarSign, Video, 
  FileText, Activity, CheckSquare, TrendingUp, Calendar,
  Plus, ArrowUpRight, Award, MessageSquare, Clock, 
  ChevronLeft, AlertCircle, Sparkles, CheckCircle, Eye
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { api } from '@/lib/api';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  
  // 1. Basic Stats
  const { data: statsData } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: () => coursesApi.getInstructorStats().then(res => res.data)
  });

  // 2. Sales & Monthly Trend
  const { data: salesData } = useQuery({
    queryKey: ['instructor-sales-overview'],
    queryFn: () => api.get('/instructor/sales').then(res => res.data?.data || null)
  });

  // 3. Courses
  const { data: coursesResponse } = useQuery({
    queryKey: ['instructor-dashboard-courses'],
    queryFn: () => coursesApi.getInstructorCourses({ limit: 5 }).then(res => res.data)
  });

  // 4. Upcoming Classes
  const { data: upcomingClasses = [] } = useQuery({
    queryKey: ['instructor-upcoming-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data?.data || res.data || [])
  });

  // 5. Pending Submissions to grade
  const { data: pendingSubmissions } = useQuery({
    queryKey: ['instructor-pending-submissions-count'],
    queryFn: () => api.get('/instructor/submissions', { params: { status: 'submitted', limit: 5 } }).then(res => res.data?.data || res.data)
  });

  // 6. Quizzes
  const { data: quizzesList = [] } = useQuery({
    queryKey: ['instructor-quizzes-overview'],
    queryFn: () => api.get('/instructor/quizzes').then(res => res.data?.data || [])
  });

  // 7. Recent Students
  const { data: recentStudentsData } = useQuery({
    queryKey: ['instructor-recent-students'],
    queryFn: () => coursesApi.getInstructorStudents({ limit: 5 }).then(res => res.data)
  });

  const courses = coursesResponse?.courses || [];
  const recentStudents = recentStudentsData?.students || [];
  const pendingSubs = pendingSubmissions?.submissions || [];
  const monthlyTrend = salesData?.monthlyTrend || [];
  
  const totalRevenue = salesData?.totalSales ?? (statsData?.totalRevenue || 0);
  const netEarnings = salesData?.netInstructorEarnings ?? Math.round(totalRevenue * 0.7);
  const totalStudents = statsData?.totalStudents ?? 0;
  const totalCourses = statsData?.totalCourses ?? courses.length;
  const publishedCourses = statsData?.publishedCourses ?? courses.filter((c: any) => c.status === 'published').length;

  const maxRevenueInTrend = Math.max(...monthlyTrend.map((m: any) => m.revenue), 100000);

  const activeLiveClasses = Array.isArray(upcomingClasses) 
    ? upcomingClasses.filter((c: any) => c.status === 'published')?.slice(0, 3) 
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-l from-[var(--neo-primary)]/10 via-[var(--neo-surface)] to-[var(--neo-surface)] rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--neo-border)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-emerald-400/15 to-blue-500/15 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              پنل جامع مدرسان تک‌یاد
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-2">
              سلام استاد {user?.lastName || user?.firstName || ''}! 🎓
            </h1>
            <p className="text-[var(--neo-text-secondary)] text-sm sm:text-base max-w-2xl leading-relaxed">
              مرکز کنترل و مدیریت دوره‌ها، درآمد، آزمون‌ها و تکالیف شما. وضعیت تعامل دانشجویان و رشد درآمدی خود را در این صفحه دنبال کنید.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link 
              href="/instructor/courses/new" 
              className="px-4 py-2.5 bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white rounded-2xl font-bold shadow-lg shadow-[var(--neo-primary)]/20 transition-all hover:scale-105 flex items-center gap-2 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              ایجاد دوره جدید
            </Link>

            <Link 
              href="/instructor/quizzes" 
              className="px-4 py-2.5 bg-[var(--neo-surface)] hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <CheckSquare className="w-4 h-4 text-[var(--neo-primary)]" />
              طراحی کوییز
            </Link>

            <Link 
              href="/instructor/assignments" 
              className="px-4 py-2.5 bg-[var(--neo-surface)] hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              تعریف تکلیف
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Earnings */}
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              سهم شما ۷۰٪
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-1">
            {netEarnings.toLocaleString()} <span className="text-xs font-bold text-[var(--neo-text-secondary)]">تومان</span>
          </div>
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] flex items-center gap-1.5">
            درآمد خالص کسب شده
            <Link href="/instructor/sales" className="text-[var(--neo-primary)] hover:underline mr-auto">
              جزئیات مالی
            </Link>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 rounded-2xl bg-[var(--neo-primary)] text-white shadow-lg shadow-[var(--neo-primary)]/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[var(--neo-primary)]">
              دانشجویان
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-1">
            {totalStudents.toLocaleString()} <span className="text-xs font-bold text-[var(--neo-text-secondary)]">نفر</span>
          </div>
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] flex items-center gap-1.5">
            کل دانش‌آموختگان دوره‌های شما
            <Link href="/instructor/students" className="text-[var(--neo-primary)] hover:underline mr-auto">
              مشاهده لیست
            </Link>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              {publishedCourses} منتشر شده
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-1">
            {totalCourses} <span className="text-xs font-bold text-[var(--neo-text-secondary)]">دوره</span>
          </div>
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] flex items-center gap-1.5">
            محتوای آموزشی ایجاد شده
            <Link href="/instructor/courses" className="text-[var(--neo-primary)] hover:underline mr-auto">
              مدیریت
            </Link>
          </div>
        </div>

        {/* Pending Grading / Tasks */}
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            {pendingSubs.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                نیازمند اقدام
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] mb-1">
            {pendingSubs.length} <span className="text-xs font-bold text-[var(--neo-text-secondary)]">تکلیف</span>
          </div>
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] flex items-center gap-1.5">
            در انتظار بررسی و نمره‌دهی
            <Link href="/instructor/assignments" className="text-amber-600 hover:underline mr-auto font-bold">
              ثبت نمره
            </Link>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart + Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Revenue Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--neo-surface)] rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--neo-border)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                روند درآمد ماهیانه شما
              </h3>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">درآمد ناخالص و تعداد فروش طی ۶ ماه گذشته</p>
            </div>
            <Link 
              href="/instructor/sales" 
              className="text-xs font-bold text-[var(--neo-primary)] hover:underline flex items-center gap-1"
            >
              گزارش جامع مالی
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Chart Bars */}
          {monthlyTrend.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-[var(--neo-text-secondary)] border border-dashed border-[var(--neo-border)] rounded-2xl">
              هنوز آمار فروش برای نمایش نمودار ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                {monthlyTrend.map((m: any, idx: number) => {
                  const heightPercent = maxRevenueInTrend > 0 ? Math.max((m.revenue / maxRevenueInTrend) * 100, 8) : 8;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-20">
                        {m.revenue.toLocaleString()} تومان ({m.salesCount} فروش)
                      </div>

                      <div className="w-full max-w-[48px] bg-[var(--neo-surface-2)] rounded-2xl overflow-hidden flex flex-col justify-end h-full p-1">
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-[var(--neo-primary)] to-blue-400 rounded-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-400"
                        />
                      </div>

                      <span className="text-[11px] font-bold text-[var(--neo-text-secondary)]">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[var(--neo-border)] flex justify-between items-center text-xs text-[var(--neo-text-secondary)]">
                <span>مجموع فروش کل دوره: <strong className="text-[var(--neo-text-main)] font-black">{totalRevenue.toLocaleString()} تومان</strong></span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> تسویه منظم ماهیانه
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Review / Urgent Tasks (1 col) */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--neo-border)] flex flex-col">
          <h3 className="text-lg font-black text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            امور نیازمند توجه شما
          </h3>

          <div className="space-y-3 flex-1">
            {/* Pending Assignments */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-900">
                  {pendingSubs.length} پاسخ تکلیف در انتظار بررسی
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  دانشجویان منتظر دریافت نمره و بازخورد استاد هستند.
                </div>
                <Link 
                  href="/instructor/assignments" 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline mt-2"
                >
                  شروع نمره‌دهی
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quizzes Status */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-start gap-3">
              <CheckSquare className="w-5 h-5 text-[var(--neo-primary)] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-blue-900">
                  {quizzesList.length} کوییز و آزمون فعال
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  برای سنجش یادگیری، آزمون پایان فصل طراحی کنید.
                </div>
                <Link 
                  href="/instructor/quizzes" 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--neo-primary)] hover:underline mt-2"
                >
                  مدیریت آزمون‌ها
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Live Class reminder */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 flex items-start gap-3">
              <Video className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-purple-900">
                  {activeLiveClasses.length} وبینار یا کلاس زنده
                </div>
                <div className="text-[11px] text-purple-700 mt-0.5">
                  پشتیبانی آنلاین و رفع اشکال تعاملی با دانشجویان.
                </div>
                <Link 
                  href="/instructor/classes" 
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 hover:underline mt-2"
                >
                  برنامه کلاس‌ها
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom 2 Columns: Top Courses & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Courses */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--neo-border)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--neo-primary)]" />
              دوره‌های اخیر شما
            </h3>
            <Link href="/instructor/courses" className="text-xs font-bold text-[var(--neo-primary)] hover:underline">
              همه دوره‌ها ({totalCourses})
            </Link>
          </div>

          <div className="space-y-3">
            {courses.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--neo-text-secondary)]">
                هنوز دوره‌ای ایجاد نکرده‌اید.
              </div>
            ) : (
              courses.slice(0, 4).map((course: any) => (
                <div key={course._id} className="p-3.5 rounded-2xl bg-[var(--neo-surface-2)]/60 border border-[var(--neo-border)] flex items-center justify-between gap-3 hover:bg-[var(--neo-surface-2)] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-10 rounded-xl bg-[var(--neo-surface)] overflow-hidden shrink-0 border border-[var(--neo-border)] flex items-center justify-center">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-[var(--neo-text-secondary)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[var(--neo-text-main)] truncate">{course.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[var(--neo-text-secondary)] mt-0.5">
                        <span>{course.price === 0 ? 'رایگان' : `${course.price?.toLocaleString()} تومان`}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{course.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/instructor/courses/${course._id}/edit`}
                      className="p-2 rounded-xl bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 transition-colors"
                      title="ویرایش سرفصل‌ها"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--neo-border)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              آخرین دانشجویان ثبت‌نام شده
            </h3>
            <Link href="/instructor/students" className="text-xs font-bold text-[var(--neo-primary)] hover:underline">
              مشاهده تمام دانشجویان
            </Link>
          </div>

          <div className="space-y-3">
            {recentStudents.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--neo-text-secondary)]">
                هنوز دانشجویی ثبت‌نام نکرده است.
              </div>
            ) : (
              recentStudents.slice(0, 4).map((student: any) => (
                <div key={student._id} className="p-3.5 rounded-2xl bg-[var(--neo-surface-2)]/60 border border-[var(--neo-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm shrink-0">
                      {student.firstName?.[0] || 'د'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[var(--neo-text-main)] truncate">
                        {student.firstName} {student.lastName}
                      </h4>
                      <div className="text-xs text-[var(--neo-text-secondary)] truncate mt-0.5">
                        {student.courseTitle || student.email || 'دانشجو'}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-xs text-[var(--neo-text-secondary)] block">
                      {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('fa-IR') : 'به‌تازگی'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      فعال
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Upcoming Classes Section */}
      {activeLiveClasses.length > 0 && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 sm:p-7 shadow-sm border border-[var(--neo-border)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--neo-primary)]" />
              کلاس‌های زنده و وبینارهای آینده شما
            </h3>
            <Link href="/instructor/classes" className="text-xs font-bold text-[var(--neo-primary)] hover:underline">
              مشاهده همه کلاس‌ها
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeLiveClasses.map((cls: any) => {
              const date = new Date(cls.startDate);
              const day = date.getDate();
              const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
              const time = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={cls._id} className="p-4 rounded-2xl bg-[var(--neo-surface-2)]/60 border border-[var(--neo-border)] flex items-center gap-4">
                  <div className="w-14 h-14 bg-[var(--neo-surface)] rounded-2xl border border-[var(--neo-border)] flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-[10px] font-bold text-red-500">{monthName}</span>
                    <span className="text-lg font-black text-[var(--neo-text-main)]">{day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[var(--neo-text-main)] truncate">{cls.title}</h4>
                    <div className="text-xs text-[var(--neo-text-secondary)] mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>ساعت {time}</span>
                    </div>
                  </div>
                  {cls.meetingLink && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--neo-primary)] transition-colors shrink-0"
                    >
                      ورود
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
