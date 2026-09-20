'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { learningApi } from '@/features/learning/api/learning.api';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, PlayCircle, BarChart, FileText, CheckSquare,
  GraduationCap, CreditCard, Heart, Ticket, Bell, Video,
  Clock, ArrowLeft, Trophy, Calendar, Loader2, Search
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading: dashboardLoading, isError: dashboardError } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => learningApi.getStudentDashboard().then(res => res.data)
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => commerceApi.getMyOrders().then(res => res.data)
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data)
  });

  if (dashboardLoading || ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[var(--neo-primary)] animate-spin" />
        <p className="text-[var(--neo-text-secondary)] font-medium">در حال بارگذاری اطلاعات داشبورد...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <BarChart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--neo-text-main)]">خطا در بارگذاری داشبورد</h2>
        <p className="text-[var(--neo-text-secondary)] text-center max-w-md">متاسفانه در دریافت اطلاعات داشبورد شما مشکلی به وجود آمد. لطفاً اتصال خود را بررسی کرده و مجدداً تلاش کنید.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[var(--neo-primary)] text-white rounded-xl font-bold hover:bg-blue-700 transition">
          تلاش دوباره
        </button>
      </div>
    );
  }

  const statsData = dashboardData?.stats || { activeCourses: 0, completedLessons: 0, pendingAssignments: 0 };
  const recentEnrollments = dashboardData?.recentEnrollments || [];
  const latestQuizzes = dashboardData?.latestQuizzes || [];
  const orders = ordersData || [];
  const notifications = notificationsData || [];

  const continueCourse = recentEnrollments.length > 0 ? recentEnrollments[0] : null;

  const stats = [
    { label: 'دوره‌های فعال', value: statsData.activeCourses, icon: BookOpen, color: 'bg-[var(--neo-primary)]', link: '/student/courses' },
    { label: 'دروس تکمیل شده', value: statsData.completedLessons, icon: CheckSquare, color: 'bg-emerald-500', link: '/student/courses' },
    { label: 'تکالیف در انتظار', value: statsData.pendingAssignments, icon: FileText, color: 'bg-amber-500', link: '/student/assignments' },
    { label: 'سفارشات', value: orders.length, icon: CreditCard, color: 'bg-purple-500', link: '/student/orders' },
  ];

  const quickLinks = [
    { label: 'دوره‌های من', icon: BookOpen, color: 'text-[var(--neo-primary)] bg-[var(--neo-primary)]/10', link: '/student/courses' },
    { label: 'تکالیف', icon: FileText, color: 'text-amber-600 bg-amber-50', link: '/student/assignments' },
    { label: 'پرداخت‌ها', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50', link: '/student/orders' },
    { label: 'علاقه‌مندی‌ها', icon: Heart, color: 'text-rose-600 bg-rose-50', link: '/student/favorites' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neo-primary)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-[var(--neo-text-main)] mb-2">سلام {user?.firstName}! 👋</h1>
          <p className="text-[var(--neo-text-secondary)] text-lg">به پنل یادگیری خود خوش آمدید. آماده‌اید تا امروز چیز جدیدی یاد بگیرید؟</p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-lg border border-[var(--neo-border)] hover:scale-105 transition-transform cursor-pointer">
            <Trophy className="w-10 h-10 text-amber-500" />
            <div>
              <div className="text-sm text-[var(--neo-text-secondary)] font-medium">امتیاز شما</div>
              <div className="text-2xl font-black text-[var(--neo-text-main)]">۱,۲۵۰ <span className="text-sm font-medium text-amber-500">XP</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link href={stat.link} key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl text-white shadow-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-[var(--neo-text-main)]">{stat.value}</div>
              </div>
              <h3 className="text-[var(--neo-text-secondary)] font-medium">{stat.label}</h3>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Learning */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-[var(--neo-primary)]" />
                ادامه یادگیری
              </h2>
              <Link href="/student/courses" className="text-sm font-bold text-[var(--neo-primary)] hover:text-[var(--neo-primary)] flex items-center gap-1">
                همه دوره‌ها <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            
            {continueCourse ? (
              <Link href={`/learn/${continueCourse.courseId?.slug}`} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[var(--neo-border)] flex flex-col sm:flex-row group hover:shadow-md transition-shadow block">
                <div className="sm:w-64 h-48 sm:h-auto relative bg-[var(--neo-surface-2)]">
                  <img src={continueCourse.courseId?.thumbnail || `https://picsum.photos/seed/${continueCourse.courseId?._id}/400/250`} alt={continueCourse.courseId?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 backdrop-blur rounded-full p-4 shadow-lg">
                      <PlayCircle className="w-8 h-8 text-[var(--neo-primary)]" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">{continueCourse.courseId?.title}</h3>
                  <p className="text-[var(--neo-text-secondary)] mb-6 text-sm">
                    {continueCourse.lastLessonId ? `آخرین جلسه: ${continueCourse.lastLessonId.title}` : 'هنوز جلسه‌ای را شروع نکرده‌اید'}
                  </p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[var(--neo-text-main)]">میزان پیشرفت</span>
                      <span className="font-bold text-[var(--neo-primary)]">{continueCourse.progress || 0}٪</span>
                    </div>
                    <div className="w-full bg-[var(--neo-surface-2)] rounded-full h-2 overflow-hidden">
                      <div className="bg-[var(--neo-primary)] h-2 rounded-full relative transition-all duration-1000" style={{ width: `${continueCourse.progress || 0}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[var(--neo-border)] shadow-sm flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">هنوز یادگیری را شروع نکرده‌اید</h3>
                <p className="text-[var(--neo-text-secondary)] mb-6">با شرکت در دوره‌های آموزشی، مهارت‌های جدیدی کسب کنید.</p>
                <Link href="/courses" className="bg-[var(--neo-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-[var(--neo-primary)]/20">
                  مشاهده دوره‌ها
                </Link>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-emerald-600" />
                سفارشات اخیر
              </h2>
              <Link href="/student/orders" className="text-sm font-bold text-[var(--neo-primary)] hover:text-[var(--neo-primary)] flex items-center gap-1">
                همه سفارشات <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
                <div className="divide-y divide-[var(--neo-border)]">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order._id} className="p-4 sm:p-6 hover:bg-[var(--neo-surface-2)] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[var(--neo-text-main)] font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'paid' ? 'پرداخت شده' : order.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                          </span>
                        </div>
                        <div className="text-sm text-[var(--neo-text-secondary)]">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                        <div className="text-left">
                          <div className="font-bold text-[var(--neo-text-main)]">{order.totalAmount?.toLocaleString('fa-IR')} تومان</div>
                          <div className="text-xs text-[var(--neo-text-secondary)]">{order.items?.length || 0} آیتم</div>
                        </div>
                        <Link href={`/student/orders/${order._id}`} className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition">
                          <ArrowLeft className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-[var(--neo-border)] shadow-sm">
                <p className="text-[var(--neo-text-secondary)]">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Space */}
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--neo-text-main)]">دسترسی سریع</h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)]">
              <div className="grid grid-cols-2 gap-4">
                {quickLinks.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <Link href={link.link} key={i} className="flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-[var(--neo-surface-2)] transition-colors gap-3 border border-transparent hover:border-[var(--neo-border)] text-center">
                      <div className={`p-4 rounded-2xl ${link.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-[var(--neo-text-main)]">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notifications Preview */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Bell className="w-6 h-6 text-amber-500" />
                اعلان‌های اخیر
              </h2>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)]">
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notif: any) => (
                    <Link href="/student/notifications" key={notif._id} className="flex items-start gap-3 p-3 hover:bg-[var(--neo-surface-2)] rounded-xl transition cursor-pointer block">
                      {!notif.readAt ? (
                        <div className="w-2 h-2 mt-2 bg-[var(--neo-primary)] rounded-full shrink-0"></div>
                      ) : (
                        <div className="w-2 h-2 mt-2 bg-transparent rounded-full shrink-0"></div>
                      )}
                      <div>
                        <h4 className={`text-sm font-bold ${!notif.readAt ? 'text-[var(--neo-text-main)]' : 'text-[var(--neo-text-main)]'}`}>{notif.title}</h4>
                        <p className="text-xs text-[var(--neo-text-secondary)] mt-1 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-[var(--neo-text-muted)] mt-2 block">
                          {new Date(notif.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4 text-[var(--neo-text-secondary)] text-sm">
                    اعلان جدیدی ندارید
                  </div>
                )}
                <div className="text-center pt-2">
                  <Link href="/student/notifications" className="text-sm font-bold text-[var(--neo-primary)] hover:text-[var(--neo-primary)]">مشاهده همه اعلان‌ها</Link>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
