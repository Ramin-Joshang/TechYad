'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Monitor, MapPin, Calendar, Clock, Users, ShieldCheck, CheckCircle, Star, ArrowLeft, BookOpen, Target, FileText } from 'lucide-react';
import { format } from 'date-fns-jalali';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function ClassDetailsContainer({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitializing } = useAuthStore();

  const { data: cls, isLoading } = useQuery({
    queryKey: ['class', slug],
    queryFn: async () => {
      const res: any = await api.get(`/classes/${encodeURIComponent(slug)}`);
      return res?.data !== undefined ? res.data : res;
    }
  });

  // Check enrollment in class
  const { data: enrollmentData } = useQuery({
    queryKey: ['classEnrollment', cls?._id],
    queryFn: async () => {
      const res: any = await api.get(`/classes/${cls._id}/enrollment`, { headers: { 'X-Hide-Error-Toast': 'true' } });
      return res?.data !== undefined ? res.data : res;
    },
    enabled: !!isAuthenticated && !isInitializing && !!cls?._id,
  });

  const isEnrolled = !!enrollmentData;

  // Add to cart mutation for paid classes
  const addToCartMutation = useMutation({
    mutationFn: () => commerceApi.addToCart('class', cls._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('کلاس به سبد خرید اضافه شد');
      router.push('/cart');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در افزودن به سبد خرید');
    }
  });

  // Free class instant enrollment mutation
  const enrollFreeMutation = useMutation({
    mutationFn: () => api.post(`/classes/${cls._id}/enroll-free`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classEnrollment', cls?._id] });
      queryClient.invalidateQueries({ queryKey: ['class', slug] });
      toast.success('ثبت‌نام شما در این کلاس با موفقیت انجام شد!');
      router.push('/student/classes');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت‌نام کلاس');
    }
  });

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast('برای ثبت‌نام در کلاس، لطفاً ابتدا وارد حساب کاربری شوید', { icon: '🔒' });
      router.push(`/login?redirect=/classes/${encodeURIComponent(slug)}`);
      return;
    }

    if (isEnrolled) {
      router.push('/student/classes');
      return;
    }

    if (cls.price === 0) {
      enrollFreeMutation.mutate();
    } else {
      addToCartMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--neo-bg)] min-h-screen pb-32 animate-pulse">
        <div className="bg-slate-900 text-white pt-16 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 w-full">
              <div className="flex gap-3">
                <div className="h-6 w-24 bg-slate-800 rounded-full"></div>
                <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
              </div>
              <div className="h-10 bg-slate-800 rounded-xl w-3/4"></div>
              <div className="h-6 bg-slate-800 rounded-lg w-full"></div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-slate-800 rounded-xl"></div>
                <div className="h-12 w-32 bg-slate-800 rounded-xl"></div>
              </div>
            </div>
            <div className="w-full md:w-96 aspect-video bg-slate-800 rounded-2xl"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-[var(--neo-border)] space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">کلاس مورد نظر یافت نشد</h2>
        <p className="text-[var(--neo-text-muted)] text-sm mb-6">ممکن است این کلاس حذف شده یا آدرس اشتباه باشد.</p>
        <Link href="/classes" className="px-6 py-2.5 bg-[var(--neo-primary)] text-white rounded-xl font-medium hover:bg-blue-700 transition">
          بازگشت به لیست کلاس‌ها
        </Link>
      </div>
    );
  }

  const isOnline = cls.mode === 'online';
  const instructor = cls.instructors?.[0];
  const startDate = cls.startDate ? new Date(cls.startDate) : new Date();
  const endDate = cls.endDate ? new Date(cls.endDate) : new Date();
  
  // Mocks based on ID for consistency
  const enrolled = cls.enrolledCount || 0; 
  const isFull = enrolled >= cls.capacity;
  const isStarted = startDate < new Date();
  const remaining = cls.capacity - enrolled;
  
  const rating = cls.rating || 0;
  const sessions = cls.sessions || 0;
  const sessionDuration = cls.sessionDuration || 0;

  // Status CTA logic
  let ctaText = 'ثبت‌نام در کلاس';
  let ctaClass = 'bg-[var(--neo-primary)] hover:bg-blue-700 text-white shadow-[var(--neo-primary)]/30 shadow-lg';
  let ctaDisabled = false;

  if (cls.status === 'completed') {
    ctaText = 'کلاس پایان یافته';
    ctaClass = 'bg-[var(--neo-border)] text-[var(--neo-text-muted)] cursor-not-allowed';
    ctaDisabled = true;
  } else if (cls.status === 'cancelled') {
    ctaText = 'کلاس لغو شده';
    ctaClass = 'bg-red-100 text-red-600 cursor-not-allowed';
    ctaDisabled = true;
  } else if (isStarted) {
    ctaText = 'کلاس شروع شده';
    ctaClass = 'bg-[var(--neo-border)] text-[var(--neo-text-muted)] cursor-not-allowed';
    ctaDisabled = true;
  } else if (isFull) {
    ctaText = 'ظرفیت تکمیل';
    ctaClass = 'bg-[var(--neo-border)] text-[var(--neo-text-muted)] cursor-not-allowed';
    ctaDisabled = true;
  }

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-32">
      {/* Hero */}
      <div className="bg-slate-900 text-white pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${isOnline ? 'bg-[var(--neo-secondary)]/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {isOnline ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {isOnline ? 'کلاس آنلاین' : 'کلاس حضوری'}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-white">
                {cls.type === 'private' ? 'خصوصی' : 'عمومی'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{cls.title}</h1>
            
            <div className="flex flex-wrap items-center gap-8 text-gray-300 bg-white/5 p-4 rounded-2xl">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[var(--neo-secondary)]/20 rounded-full flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-400" /></div>
                 <div>
                   <div className="text-xs text-[var(--neo-text-muted)]">تاریخ شروع</div>
                   <div className="font-bold text-white">{format(startDate, 'd MMMM yyyy')}</div>
                 </div>
               </div>
               <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center"><Clock className="w-5 h-5 text-purple-400" /></div>
                 <div>
                   <div className="text-xs text-[var(--neo-text-muted)]">تعداد جلسات</div>
                   <div className="font-bold text-white">{sessions} جلسه</div>
                 </div>
               </div>
               <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-emerald-400" /></div>
                 <div>
                   <div className="text-xs text-[var(--neo-text-muted)]">ظرفیت</div>
                   <div className="font-bold text-white">{cls.capacity} نفر</div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="w-full md:w-[400px]">
             <img src={`https://picsum.photos/seed/${cls._id}/800/600`} alt={cls.title} className="w-full h-[280px] object-cover rounded-2xl shadow-2xl border-4 border-white/10" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview */}
            <section className="bg-white rounded-2xl shadow-xl border border-[var(--neo-border)] p-8">
              <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[var(--neo-primary)]" />
                معرفی کلاس
              </h2>
              <div className="prose prose-blue max-w-none text-[var(--neo-text-secondary)] leading-loose whitespace-pre-wrap">
                {cls.description}
              </div>
            </section>

            {/* Target Audience & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-white rounded-2xl shadow-xl border border-[var(--neo-border)] p-8">
                <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[var(--neo-primary)]" />
                  مناسب چه کسانی است؟
                </h2>
                <ul className="space-y-3 text-[var(--neo-text-secondary)] text-sm">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> علاقه‌مندان به یادگیری عمیق و اصولی</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> افرادی که به دنبال ارتقای مهارت‌های شغلی هستند</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> دانشجویان و فارغ‌التحصیلان</li>
                </ul>
              </section>
              <section className="bg-white rounded-2xl shadow-xl border border-[var(--neo-border)] p-8">
                <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--neo-primary)]" />
                  پیش‌نیازها
                </h2>
                <ul className="space-y-3 text-[var(--neo-text-secondary)] text-sm">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-[var(--neo-primary)] rounded-full mt-2 shrink-0"></div> آشنایی اولیه با مفاهیم پایه</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-[var(--neo-primary)] rounded-full mt-2 shrink-0"></div> کامپیوتر یا لپ‌تاپ مناسب (برای کلاس‌های عملی)</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-[var(--neo-primary)] rounded-full mt-2 shrink-0"></div> تعهد به انجام تمرین‌ها</li>
                </ul>
              </section>
            </div>

            {/* Logistics */}
            <section className="bg-white rounded-2xl shadow-xl border border-[var(--neo-border)] p-8">
              <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6">اطلاعات برگزاری</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-4 bg-[var(--neo-bg)] rounded-xl">
                   <div className="w-10 h-10 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] rounded-full flex items-center justify-center flex-shrink-0">
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="font-bold text-[var(--neo-text-main)] mb-1">تاریخ‌ها</h3>
                     <p className="text-sm text-[var(--neo-text-secondary)]">شروع: {format(startDate, 'yyyy/MM/dd')}</p>
                     <p className="text-sm text-[var(--neo-text-secondary)]">پایان: {format(endDate, 'yyyy/MM/dd')}</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-[var(--neo-bg)] rounded-xl">
                   <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                     <Clock className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="font-bold text-[var(--neo-text-main)] mb-1">زمان‌بندی</h3>
                     <p className="text-sm text-[var(--neo-text-secondary)]">تعداد: {sessions} جلسه</p>
                     <p className="text-sm text-[var(--neo-text-secondary)]">مدت: {sessionDuration} دقیقه هر جلسه</p>
                   </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-[var(--neo-bg)] rounded-xl sm:col-span-2">
                   <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                     {isOnline ? <Monitor className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                   </div>
                   <div>
                     <h3 className="font-bold text-[var(--neo-text-main)] mb-1">{isOnline ? 'مکان برگزاری: پلتفرم آنلاین (اسکای‌روم)' : 'مکان برگزاری: حضوری'}</h3>
                     <p className="text-sm text-[var(--neo-text-secondary)] mt-1">{isOnline ? 'لینک ورود به کلاس و نام کاربری پس از ثبت‌نام در پنل کاربری شما قرار می‌گیرد.' : (cls.location || 'تهران، مرکز نوآوری - ساختمان شماره ۲ - کلاس ۱۰۴')}</p>
                   </div>
                 </div>
              </div>
            </section>

            {/* Instructor */}
            {instructor && (
              <section className="bg-white rounded-2xl shadow-xl border border-[var(--neo-border)] p-8">
                <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6">درباره استاد</h2>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}`} className="w-24 h-24 rounded-2xl object-cover" alt="Instructor" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--neo-text-main)]">{instructor.firstName} {instructor.lastName}</h3>
                    <div className="text-sm font-medium text-[var(--neo-primary)] mb-4">متخصص و مدرس ارشد</div>
                    <p className="text-[var(--neo-text-secondary)] text-sm leading-relaxed mb-4">
                      دارای سال‌ها تجربه درخشان در زمینه آموزش و اجرای پروژه‌های عملی. تمرکز بر انتقال مفاهیم به ساده‌ترین شکل و آماده‌سازی دانشجویان برای بازار کار.
                    </p>
                    <Link href={`/instructors/${instructor._id}`} className="inline-flex items-center gap-2 text-[var(--neo-primary)] font-bold text-sm hover:text-blue-700">
                      مشاهده پروفایل کامل <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>
            )}

          </div>
          
          {/* Sidebar CTA */}
          <div className="lg:col-span-1 hidden lg:block">
             <div className="bg-white rounded-3xl shadow-2xl border border-[var(--neo-border)] p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-sm text-[var(--neo-text-muted)] mb-2">هزینه ثبت‌نام</div>
                  <div className="text-3xl font-bold text-[var(--neo-primary)]">
                    {cls.price === 0 ? 'رایگان' : `${cls.price.toLocaleString()} تومان`}
                  </div>
                </div>
                
                {/* Capacity UI */}
                <div className="bg-[var(--neo-bg)] p-4 rounded-xl mb-6">
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-[var(--neo-text-secondary)] font-medium">وضعیت ظرفیت:</span>
                     <span className="font-bold text-[var(--neo-text-main)]">{enrolled} نفر ثبت‌نام</span>
                   </div>
                   <div className="w-full bg-[var(--neo-border)] rounded-full h-2 mb-2">
                     <div className={`h-2 rounded-full ${isFull ? 'bg-rose-500' : remaining <= 3 ? 'bg-orange-500' : 'bg-[var(--neo-primary)]'}`} style={{ width: `${Math.min(100, (enrolled / cls.capacity) * 100)}%` }}></div>
                   </div>
                   <div className="text-xs text-center text-[var(--neo-text-muted)]">
                     {isFull ? 'ظرفیت تکمیل شده' : `${remaining} جای خالی باقی مانده`}
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[var(--neo-text-secondary)]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>دسترسی به گروه پشتیبانی کلاس</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--neo-text-secondary)]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>دریافت فایل‌های ضبط شده (آنلاین)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--neo-text-secondary)]">
                    <ShieldCheck className="w-5 h-5 text-[var(--neo-secondary)]" />
                    <span>تضمین کیفیت آموزش</span>
                  </div>
                </div>

                <button 
                  onClick={handleEnrollClick}
                  disabled={ctaDisabled || isPendingAction}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-4 flex items-center justify-center gap-2 ${ctaClass} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isPendingAction ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال انجام...</span>
                    </>
                  ) : (
                    ctaText
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--neo-border)] p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
        <div>
          <div className="text-xs text-[var(--neo-text-muted)] mb-0.5">هزینه ثبت‌نام</div>
          <div className="text-lg font-bold text-[var(--neo-primary)]">
            {cls.price === 0 ? 'رایگان' : `${cls.price.toLocaleString()} تومان`}
          </div>
        </div>
        <button 
          onClick={handleEnrollClick}
          disabled={ctaDisabled || isPendingAction}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${ctaClass} disabled:opacity-60 disabled:cursor-not-allowed text-sm`}
        >
          {isPendingAction ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ثبت...</span>
            </>
          ) : (
            ctaText
          )}
        </button>
      </div>
    </div>
  );
}
