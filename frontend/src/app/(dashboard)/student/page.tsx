'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { learningApi } from '@/features/learning/api/learning.api';
import { classesApi } from '@/features/learning/api/classes.api';
import { walletApi } from '@/features/wallet/api/wallet.api';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { referralApi } from '@/features/referral/api/referral.api';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, PlayCircle, BarChart, FileText, CheckSquare,
  GraduationCap, CreditCard, Heart, Ticket, Bell, Video,
  Clock, ArrowLeft, Trophy, Calendar, Loader2, Search,
  Wallet, Sparkles, AlertTriangle, CheckCircle2, ChevronLeft,
  MapPin, ExternalLink, Share2, Copy, Check, Flame, ArrowUpRight,
  ClipboardCheck, Award, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { StudentAttendanceModal } from '@/components/classes/StudentAttendanceModal';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState<any | null>(null);

  // 1. Learning Dashboard Core
  const { data: dashboardData, isLoading: dashboardLoading, isError: dashboardError } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => learningApi.getStudentDashboard().then(res => res.data)
  });

  // 2. Student's Registered Classes & Live Sessions
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: async () => {
      const res = await classesApi.getMyClasses();
      return res.data;
    }
  });

  // 3. Wallet Overview
  const { data: walletData } = useQuery({
    queryKey: ['myWalletOverview', user?.id],
    queryFn: () => walletApi.getOverview().then(res => res.data),
    staleTime: 1000 * 30,
  });

  // 4. Orders & Invoices
  const { data: ordersData } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => commerceApi.getMyOrders().then(res => res.data)
  });

  // 5. Notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['myNotifications'],
    queryFn: () => notificationsApi.getNotifications().then(res => res.data)
  });

  // 6. Referral info
  const { data: referralData } = useQuery({
    queryKey: ['myReferralInfo'],
    queryFn: async () => {
      const res = await referralApi.getMyInfo();
      return res.data;
    }
  });

  if (dashboardLoading || classesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-600 font-bold text-sm">در حال بارگذاری و تحلیل اطلاعات تحصیلی شما...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 bg-white rounded-3xl p-8 border border-red-100 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <BarChart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">خطا در بارگذاری داشبورد</h2>
        <p className="text-slate-500 text-center max-w-md text-sm">
          متاسفانه در دریافت اطلاعات داشبورد یادگیری شما مشکلی به وجود آمد. لطفاً اتصال خود را بررسی کرده و مجدداً تلاش کنید.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm text-sm"
        >
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
  const myClasses = classesData || [];

  const continueCourse = recentEnrollments.length > 0 ? recentEnrollments[0] : null;

  // Find classes with pending deposit remaining balance
  const depositClasses = myClasses.filter((c: any) => c.paymentType === 'deposit' && !c.remainingPaid);

  // Next active class
  const nextClass = myClasses.length > 0 ? myClasses[0] : null;

  const handleCopyReferral = () => {
    const link = referralData?.shareLinks?.directLink || `${window.location.origin}/register?ref=${referralData?.referralCode || user?.id?.substring(0, 8)}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    toast.success('لینک دعوت اختصاصی شما کپی شد!');
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16">

      {/* TOP HERO WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 md:p-10 shadow-xl shadow-blue-900/10">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>پنل تخصصی یادگیری و مهارت‌آموزی دانشجو</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              سلام، {user?.firstName || 'دانشجوی'} عزیز! 🚀
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
              امروز بهترین زمان برای پیشبرد مهارت‌های شماست. دروس جدید، وبینارهای پیش‌رو و تمارین کلاسی آماده تعامل هستند.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {continueCourse ? (
                <Link
                  href={`/learn/${continueCourse.courseId?.slug}`}
                  className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4 text-blue-600" />
                  ادامه آخرین درس ({continueCourse.courseId?.title?.substring(0, 24)}...)
                </Link>
              ) : (
                <Link
                  href="/courses"
                  className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  کاوش و ثبت‌نام در دوره‌ها
                </Link>
              )}

              <Link
                href="/student/classes"
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-purple-200" />
                کلاس‌ها و کارگاه‌های من ({myClasses.length})
              </Link>
            </div>
          </div>

          {/* Gamification / XP Pill Box */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-inner">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-blue-200 block font-bold">سطح دانشجو و امتیاز</span>
                <div className="text-lg sm:text-2xl font-black text-white flex items-center gap-1 font-mono">
                  <span>{(1250 + (statsData.completedLessons || 0) * 50).toLocaleString('fa-IR')}</span>
                  <span className="text-[10px] sm:text-xs text-amber-300 font-sans">XP</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-inner">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-400/20 text-rose-300 border border-rose-300/30 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] text-blue-200 block font-bold">زنجیره مطالعه مداوم</span>
                <div className="text-lg sm:text-2xl font-black text-white flex items-center gap-1 font-mono">
                  <span>۷</span>
                  <span className="text-[10px] sm:text-xs text-rose-300 font-sans">روز متوالی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRE-REGISTRATION / DEPOSIT REMAINING BALANCE WARNING BANNER */}
      {depositClasses.length > 0 && (
        <div className="space-y-3">
          {depositClasses.map((dClass: any) => (
            <div 
              key={dClass._id}
              className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                      اقساط و تسویه بیعانه
                    </span>
                    <h3 className="font-black text-sm text-amber-950">
                      ثبت‌نام موقت در کلاس: {dClass.title}
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    شما این کلاس را با پرداخت بیعانه رزرو کرده‌اید. مبلغ مانده بدهی: {' '}
                    <span className="font-black text-amber-950 font-mono text-sm">
                      {dClass.remainingBalance?.toLocaleString('fa-IR') || '۰'} تومان
                    </span>
                    {' '}است که پس از جلسه دوم کلاس موعد تسویه آن فرا می‌رسد.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedAttendanceClass(dClass)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  تسویه مانده شهریه
                </button>
                <Link
                  href="/student/classes"
                  className="px-3.5 py-2.5 bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold rounded-xl transition"
                >
                  مشاهده کلاس
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Active Courses */}
        <Link 
          href="/student/courses"
          className="bg-white p-3.5 sm:p-6 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono">
              {statsData.activeCourses || recentEnrollments.length || 0}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">دوره‌های در حال یادگیری</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">مشاهده محتوا و ویدیوها</p>
        </Link>

        {/* Card 2: Classes & Workshops */}
        <Link 
          href="/student/classes"
          className="bg-white p-3.5 sm:p-6 rounded-3xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono">
              {myClasses.length || 0}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">کلاس‌های آنلاین و حضوری</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">تقویم جلسات و حضور و غیاب</p>
        </Link>

        {/* Card 3: Completed Lessons */}
        <Link 
          href="/student/courses"
          className="bg-white p-3.5 sm:p-6 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono">
              {statsData.completedLessons || 0}
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">دروس و جلسات پاس شده</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">پیشرفت مداوم کلاسی</p>
        </Link>

        {/* Card 4: Wallet Balance */}
        <Link 
          href="/student/wallet"
          className="bg-white p-3.5 sm:p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2 sm:mb-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="text-right">
              <span className="text-base sm:text-2xl font-black text-slate-900 font-mono block">
                {((walletData?.balance ?? user?.walletBalance) || 0).toLocaleString('fa-IR')}
              </span>
              <span className="text-[9px] sm:text-[10px] text-indigo-600 font-bold">تومان</span>
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">موجودی کیف پول</h3>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">شارژ سریع و سوابق مالی</p>
        </Link>
      </div>

      {/* TWO COLUMNS DASHBOARD BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RIGHT COLUMN (2 COLUMNS SPAN): Primary Actions, Classes & Learning */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION: CONTINUE LEARNING (BIG CARD) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-blue-600" />
                ادامه یادگیری دوره‌های شما
              </h2>
              <Link 
                href="/student/courses" 
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                مشاهده همه ({recentEnrollments.length})
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {continueCourse ? (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row group">
                <div className="sm:w-72 h-48 sm:h-auto relative bg-slate-900 shrink-0 overflow-hidden">
                  <img 
                    src={continueCourse.courseId?.thumbnail || `https://picsum.photos/seed/${continueCourse.courseId?._id}/500/300`} 
                    alt={continueCourse.courseId?.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg">
                      دوره آنلاین ویدیویی
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {continueCourse.courseId?.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {continueCourse.lastLessonId 
                        ? `آخرین مبحث تماشا شده: ${continueCourse.lastLessonId.title}` 
                        : 'هنوز جلسه‌ای را شروع نکرده‌اید. با کلیک بر روی دکمه زیر جلسه اول را آغاز کنید.'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">میزان پیشرفت دوره:</span>
                      <span className="text-blue-600 font-mono">{continueCourse.progress || 0}٪</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-linear-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-700 relative"
                        style={{ width: `${Math.max(5, continueCourse.progress || 0)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">
                      دسترسی دائمی به محتوای ضبط‌شده
                    </span>
                    <Link
                      href={`/learn/${continueCourse.courseId?.slug}`}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      ادامه تماشا
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 shadow-xs flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="font-black text-slate-900 text-base">هنوز در دوره‌ای ثبت‌نام نکرده‌اید</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  با ثبت‌نام در دوره‌های تخصصی، دسترسی به ویدیوها، تکالیف و پشتیبانی اساتید را دریافت نمایید.
                </p>
                <Link
                  href="/courses"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  مشاهده کاتالوگ دوره‌ها
                </Link>
              </div>
            )}
          </section>

          {/* SECTION: NEXT LIVE CLASS OR WORKSHOP */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-600" />
                کلاس‌های تعاملی و جلسات پیش‌رو
              </h2>
              <Link 
                href="/student/classes" 
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                مدیریت کلاس‌ها
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nextClass ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          nextClass.mode === 'online' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {nextClass.mode === 'online' ? '🌐 آنلاین در اسکای‌روم' : '🏢 حضوری در سالن'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {nextClass.instructors?.[0] ? `استاد: ${nextClass.instructors[0].firstName} ${nextClass.instructors[0].lastName}` : 'استاد دوره'}
                        </span>
                      </div>
                      <h3 className="font-black text-base text-slate-900 mt-1">
                        {nextClass.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAttendanceClass(nextClass)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      title="مشاهده وضعیت حضور و غیاب جلسات"
                    >
                      <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                      وضعیت حضور و غیاب
                    </button>
                  </div>
                </div>

                {/* Schedule & Logistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">زمان برگزاری جلسات:</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{nextClass.scheduleTime || '۱۸:۰۰ الی ۲۰:۰۰'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">روزهای برگزاری:</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{nextClass.scheduleDays?.join('، ') || 'شنبه و دوشنبه'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">جلسات برگزار شده:</span>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{nextClass.totalHeldSessions || 0} از {nextClass.sessions || 10} جلسه</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {nextClass.mode === 'online' 
                      ? 'لینک ورود اختصاصی به اتاق زنده ۱۰ دقیقه قبل از شروع فعال است.'
                      : `محل کلاس: ${nextClass.city || 'تهران'} - ${nextClass.address || 'دانشگاه صنعتی شریف'}`}
                  </p>

                  {nextClass.mode === 'online' && nextClass.meetingLink ? (
                    <a
                      href={nextClass.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      ورود به اتاق وبینار
                    </a>
                  ) : (
                    <Link
                      href={`/classes/${nextClass.slug || nextClass._id}`}
                      target="_blank"
                      className="w-full sm:w-auto px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      مشاهده جزییات کلاس
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 shadow-xs flex flex-col items-center justify-center space-y-3">
                <Video className="w-10 h-10 text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">در حال حاضر کلاسی ندارید</h4>
                <p className="text-xs text-slate-400">می‌توانید در کارگاه‌ها و کلاس‌های آنلاین تعاملی ما ثبت‌نام کنید.</p>
                <Link
                  href="/classes"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition"
                >
                  مشاهده لیست کلاس‌های زنده
                </Link>
              </div>
            )}
          </section>

          {/* SECTION: OTHER ENROLLED COURSES CAROUSEL/GRID */}
          {recentEnrollments.length > 1 && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-700" />
                سایر دوره‌های ثبت‌نامی شما
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentEnrollments.slice(1, 5).map((item: any) => (
                  <div 
                    key={item._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 hover:shadow-sm transition-all flex gap-3.5 items-center"
                  >
                    <img 
                      src={item.courseId?.thumbnail || `https://picsum.photos/seed/${item.courseId?._id}/200/150`} 
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {item.courseId?.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>پیشرفت:</span>
                        <span className="font-bold text-blue-600 font-mono">{item.progress || 0}٪</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${item.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      href={`/learn/${item.courseId?.slug}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shrink-0"
                      title="ادامه یادگیری"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* LEFT COLUMN (1 COLUMN SPAN): Quick Links, Referrals, Notifications & Invoices */}
        <div className="space-y-8">
          
          {/* QUICK SHORTCUTS GRID */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-sm text-slate-900">دسترسی‌های سریع دانشجو</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link 
                href="/student/wallet" 
                className="p-3 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100 rounded-2xl text-center space-y-2 transition flex flex-col items-center justify-center"
              >
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-indigo-950">کیف پول</span>
              </Link>

              <Link 
                href="/student/assignments" 
                className="p-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-100 rounded-2xl text-center space-y-2 transition flex flex-col items-center justify-center"
              >
                <FileText className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-950">تکالیف من</span>
              </Link>

              <Link 
                href="/student/quizzes" 
                className="p-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 rounded-2xl text-center space-y-2 transition flex flex-col items-center justify-center"
              >
                <CheckSquare className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-rose-950">آزمون‌ها</span>
              </Link>

              <Link 
                href="/student/support" 
                className="p-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 rounded-2xl text-center space-y-2 transition flex flex-col items-center justify-center"
              >
                <Ticket className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-950">پشتیبانی</span>
              </Link>
            </div>
          </div>

          {/* REFERRAL & EARN CARD */}
          <div className="bg-linear-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-amber-300 flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">معرفی به دوستان و کسب درآمد</h4>
                <p className="text-[11px] text-purple-200">کد دعوت خود را به اشتراک بگذارید</p>
              </div>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs text-amber-300 dir-ltr select-all">
                {referralData?.referralCode || user?.id?.substring(0, 8) || 'TECYAD'}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1.5 bg-white text-purple-950 hover:bg-purple-50 text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0"
              >
                {copiedReferral ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReferral ? 'کپی شد' : 'کپی لینک'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 text-purple-200">
              <span>درآمد کسب شده:</span>
              <span className="font-black text-white font-mono">
                {(referralData?.totalEarned || 0).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <Link
              href="/student/referrals"
              className="w-full py-2 bg-white/15 hover:bg-white/25 rounded-xl text-center text-xs font-bold block transition"
            >
              مشاهده جزییات رفرال و تسویه‌حساب
            </Link>
          </div>

          {/* RECENT NOTIFICATIONS WIDGET */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                اعلان‌های اخیر
              </h3>
              <Link 
                href="/student/notifications" 
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                همه
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif: any) => (
                  <Link 
                    key={notif._id}
                    href="/student/notifications"
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition block space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      {!notif.readAt && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  اعلان جدیدی وجود ندارد
                </div>
              )}
            </div>
          </div>

          {/* RECENT ORDERS / PAYMENTS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                تراکنش‌های اخیر
              </h3>
              <Link 
                href="/student/orders" 
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                همه فاکتورها
              </Link>
            </div>

            <div className="space-y-2.5">
              {orders.length > 0 ? (
                orders.slice(0, 3).map((order: any) => (
                  <div 
                    key={order._id}
                    className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 font-mono text-[11px]">
                        #{order._id.slice(-6).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="font-black text-slate-900 block font-mono">
                        {order.totalAmount?.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className={`text-[10px] font-bold ${
                        order.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {order.status === 'paid' ? 'موفق' : 'در انتظار'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  سفارشی ثبت نشده است
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* STUDENT ATTENDANCE & PAYMENT MODAL */}
      {selectedAttendanceClass && (
        <StudentAttendanceModal
          classItem={selectedAttendanceClass}
          onClose={() => setSelectedAttendanceClass(null)}
        />
      )}

    </div>
  );
}
