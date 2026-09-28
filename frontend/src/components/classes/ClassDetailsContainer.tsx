'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { classesApi } from '@/features/learning/api/classes.api';
import toast from 'react-hot-toast';
import { 
  Loader2, Monitor, MapPin, Calendar, Clock, Users, ShieldCheck, 
  CheckCircle, Star, ArrowLeft, BookOpen, Target, FileText, 
  Sparkles, CheckCircle2, ChevronDown, ChevronUp, Copy, Check,
  ExternalLink, CreditCard, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns-jalali';
import Link from 'next/link';
import { useState } from 'react';

export function ClassDetailsContainer({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isInitializing } = useAuthStore();

  const [paymentChoice, setPaymentChoice] = useState<'full' | 'deposit'>('full');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [expandedSession, setExpandedSession] = useState<number | null>(1);

  const { data: cls, isLoading } = useQuery({
    queryKey: ['class', slug],
    queryFn: async () => {
      const res: any = await classesApi.getClassBySlug(slug);
      return res?.data !== undefined ? res.data : res;
    }
  });

  // Check enrollment in class
  const { data: enrollmentData, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ['classEnrollment', cls?._id],
    queryFn: async () => {
      const res: any = await classesApi.getClassEnrollmentStatus(cls._id);
      return res?.data !== undefined ? res.data : res;
    },
    enabled: !!isAuthenticated && !isInitializing && !!cls?._id,
    staleTime: 1000 * 60 * 5,
  });

  const isEnrolled = !!enrollmentData;
  const isCheckingEnrollment = isAuthenticated && (isEnrollmentLoading || isInitializing);

  // Fetch Cart to check if class is already in cart
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceApi.getCart().then((res: any) => res.data),
    enabled: !!isAuthenticated && !isInitializing
  });

  const isInCart = cartData?.items?.some((item: any) => item.itemId === cls?._id && item.itemType === 'class');

  // Add to cart mutation for full payment
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

  // Pre-registration with deposit mutation
  const preRegisterMutation = useMutation({
    mutationFn: () => classesApi.registerForClass(cls._id, { paymentType: 'deposit' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classEnrollment', cls?._id] });
      queryClient.invalidateQueries({ queryKey: ['class', slug] });
      queryClient.invalidateQueries({ queryKey: ['myClasses'] });
      toast.success('پیش‌ثبت‌نام شما با موفقیت ثبت شد!');
      router.push('/student/classes');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'خطا در پیش‌ثبت‌نام';
      toast.error(msg, { duration: 4000 });
      if (err.response?.data?.code === 'INSUFFICIENT_BALANCE' || msg.includes('کیف پول')) {
        toast('در حال انتقال به صفحه شارژ کیف پول...', { icon: '💳' });
        setTimeout(() => {
          router.push('/student/wallet');
        }, 2000);
      }
    }
  });

  // Free class instant enrollment mutation
  const enrollFreeMutation = useMutation({
    mutationFn: () => classesApi.enrollFreeClass(cls._id),
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

  const isPendingAction = addToCartMutation.isPending || preRegisterMutation.isPending || enrollFreeMutation.isPending;

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    toast.success('آدرس محل برگزاری کپی شد');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleAction = () => {
    if (isEnrolled) {
      router.push('/student/classes');
      return;
    }

    if (!isAuthenticated) {
      toast('برای ثبت‌نام در کلاس، لطفاً ابتدا وارد حساب کاربری شوید', { icon: '🔒' });
      router.push(`/login?redirect=/classes/${encodeURIComponent(slug)}`);
      return;
    }

    if (cls?.price === 0) {
      enrollFreeMutation.mutate();
      return;
    }

    // Pre-registration Deposit selected
    if (paymentChoice === 'deposit' && cls?.allowPreRegistration) {
      preRegisterMutation.mutate();
      return;
    }

    // Full Payment
    if (isInCart) {
      router.push('/cart');
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
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
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
  
  const enrolled = cls.enrolledCount || 0; 
  const isFull = enrolled >= cls.capacity;
  const isStarted = startDate < new Date();
  const remaining = Math.max(0, cls.capacity - enrolled);
  
  const rating = cls.rating || 0;
  const sessions = cls.sessions || 10;
  const totalHours = cls.totalHours || (sessions * 1.5);

  // Build default syllabus if none provided
  const syllabusList = cls.syllabus && cls.syllabus.length > 0 ? cls.syllabus : [
    { sessionNumber: 1, title: 'جلسه افتتاحیه: آشنایی، معرفی نقشه راه و ابزارها', description: 'تشریح سرفصل‌ها، نصب نیازمندی‌های اولیه و ایجاد محیط توسعه استاندارد.', durationMinutes: 90 },
    { sessionNumber: 2, title: 'مفاهیم پایه و اصول معماری پروژه', description: 'بررسی ساختار، الگوهای طراحی استاندارد و آغاز کارگاه کدنویسی.', durationMinutes: 90 },
    { sessionNumber: 3, title: 'پیاده‌سازی ماژول‌های اصلی و تعامل زنده', description: 'کدنویسی زنده همراه با مشارکت دانشجویان و رفع خطاهای پرتکرار.', durationMinutes: 90 },
    { sessionNumber: 4, title: 'کارگاه عملی رفع اشکال و تمرین کلاسی', description: 'بررسی پروژه‌های ارسالی دانشجویان و بهینه‌سازی کدهای نوشته شده.', durationMinutes: 90 },
  ];

  // CTA Text & State
  let ctaText = 'ثبت‌نام و پرداخت شهریه';
  let ctaClass = 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 shadow-lg';
  let ctaDisabled = false;

  if (isCheckingEnrollment) {
    ctaText = 'در حال بررسی وضعیت کلاس...';
    ctaClass = 'bg-gray-100 text-gray-400 border border-gray-200 cursor-wait animate-pulse';
    ctaDisabled = true;
  } else if (isEnrolled) {
    ctaText = 'مشاهده کلاس در پنل کاربری (ثبت‌نام شده)';
    ctaClass = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 shadow-lg';
    ctaDisabled = false;
  } else if (cls.status === 'completed') {
    ctaText = 'کلاس پایان یافته';
    ctaClass = 'bg-slate-200 text-slate-500 cursor-not-allowed';
    ctaDisabled = true;
  } else if (cls.status === 'cancelled') {
    ctaText = 'کلاس لغو شده';
    ctaClass = 'bg-rose-100 text-rose-600 cursor-not-allowed';
    ctaDisabled = true;
  } else if (isFull) {
    ctaText = 'ظرفیت تکمیل شده است';
    ctaClass = 'bg-slate-200 text-slate-500 cursor-not-allowed';
    ctaDisabled = true;
  } else if (cls.price === 0) {
    ctaText = 'ثبت‌نام رایگان در کلاس';
    ctaClass = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 shadow-lg';
  } else if (paymentChoice === 'deposit' && cls.allowPreRegistration) {
    ctaText = `پیش‌ثبت‌نام با بیعانه (${cls.preRegistrationDeposit?.toLocaleString('fa-IR')} تومان)`;
    ctaClass = 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 shadow-lg';
  } else if (isInCart) {
    ctaText = 'مشاهده در سبد خرید و تکمیل ثبت‌نام';
    ctaClass = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 shadow-lg';
  }

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-32">
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-12 pb-28 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="flex-1 space-y-5">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm ${
                isOnline ? 'bg-blue-600/80 text-white' : 'bg-emerald-600/80 text-white'
              }`}>
                {isOnline ? <Monitor className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {isOnline ? 'کلاس آنلاین تعاملی (وبینار)' : 'کارگاه تخصصی حضوری'}
              </span>

              {cls.allowPreRegistration && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  امکان پیش‌ثبت‌نام با بیعانه
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                {cls.type === 'private' ? 'کلاس خصوصی' : 'کلاس عمومی'}
              </span>

              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{rating > 0 ? rating.toFixed(1) : 'جدید'}</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              {cls.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {cls.shortDescription || cls.description?.slice(0, 180) + '...'}
            </p>
            
            {/* Quick KPI Bar */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-slate-300 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">شروع کلاس</div>
                  <div className="font-bold text-sm text-white">{format(startDate, 'd MMMM yyyy')}</div>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">تعداد و ساعات</div>
                  <div className="font-bold text-sm text-white">{sessions} جلسه ({totalHours} ساعت)</div>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">ظرفیت پذیرش</div>
                  <div className="font-bold text-sm text-white">{cls.capacity} نفر ({remaining} جای خالی)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Thumbnail */}
          <div className="w-full lg:w-[420px] shrink-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 aspect-video lg:aspect-[4/3]">
              <img 
                src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/800/600`} 
                alt={cls.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                {instructor && (
                  <div className="flex items-center gap-3">
                    <img 
                      src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.firstName + ' ' + instructor.lastName)}`} 
                      className="w-10 h-10 rounded-full border-2 border-white object-cover" 
                      alt="" 
                    />
                    <div>
                      <span className="text-[11px] text-slate-300 block">مدرس کلاس:</span>
                      <span className="font-bold text-sm text-white">{instructor.firstName} {instructor.lastName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Calendar & Schedule & Venue Information Card */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  تقویم و زمان‌بندی دقیق برگزاری
                </h2>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  isOnline ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {isOnline ? 'برگزاری در اسکای‌روم' : 'برگزاری در سالن همایش'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Days of week */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">روزهای برگزاری در هفته:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.scheduleDays && cls.scheduleDays.length > 0 ? (
                      cls.scheduleDays.map((d: string) => (
                        <span key={d} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-bold">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-700 font-bold">شنبه و دوشنبه</span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">ساعت برگزاری هر جلسه:</span>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{cls.scheduleTime || '۱۸:۰۰ الی ۲۰:۰۰ (۲ ساعت)'}</span>
                  </div>
                </div>

                {/* Dates */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">بازه برگزاری:</span>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    از {format(startDate, 'd MMMM yyyy')} تا {format(endDate, 'd MMMM yyyy')}
                  </div>
                </div>

                {/* Number of sessions */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">تعداد جلسات و حضور و غیاب:</span>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">
                    {sessions} جلسه رسمی (با ثبت حضور و غیاب در هر جلسه)
                  </div>
                </div>
              </div>

              {/* In-Person Venue OR Online Details */}
              {isOnline ? (
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-blue-900">
                        محیط کلاس آنلاین: {cls.meetingPlatform || 'اسکای‌روم (Skyroom)'}
                      </h3>
                      <p className="text-xs text-blue-800 mt-0.5">
                        کلاس به صورت تعاملی دوطرفه (امکان اشتراک صدا، تصویر و اسکرین) برگزار می‌شود و ویدیوهای ضبط شده در پنل قرار می‌گیرد.
                      </p>
                    </div>
                  </div>

                  {isEnrolled && cls.meetingLink && (
                    <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">لینک اختصاصی ورود شما به کلاس:</span>
                      <a
                        href={cls.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        ورود به اتاق جلسه آنلاین
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-emerald-950">
                          محل برگزاری حضوری: {cls.city || 'تهران'}
                        </h3>
                        <p className="text-xs text-emerald-800 mt-1 leading-relaxed font-medium">
                          {cls.address || 'تهران، خیابان آزادی، دانشگاه صنعتی شریف، سالن همایش‌های رازی'}
                        </p>
                        {cls.venueDetails && (
                          <p className="text-[11px] text-emerald-700 mt-1">
                            مشخصات کلاس: {cls.venueDetails}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyAddress(`${cls.city || 'تهران'} - ${cls.address || 'تهران، خیابان آزادی، دانشگاه شریف'}`)}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      کپی آدرس
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Sessions & Syllabus Section */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                    سرفصل‌ها و جلسات کلاس
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    ریز مباحث آموزشی، تمرین‌های هر جلسه و سیر یادگیری قدم‌به‌قدم
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {syllabusList.length} جلسه برنامه‌ریزی شده
                </span>
              </div>

              <div className="space-y-3">
                {syllabusList.map((sess: any) => {
                  const isExpanded = expandedSession === sess.sessionNumber;
                  return (
                    <div 
                      key={sess.sessionNumber} 
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedSession(isExpanded ? null : sess.sessionNumber)}
                        className={`w-full p-4 text-right flex items-center justify-between gap-3 transition ${
                          isExpanded ? 'bg-emerald-50/50' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            isExpanded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sess.sessionNumber}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                              {sess.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              مدت زمان: {sess.durationMinutes || 90} دقیقه · شامل تمرین عملی
                            </span>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
                          <p>{sess.description || 'توضیحات مباحث این جلسه توسط استاد در ابتدای جلسه ارائه خواهد شد.'}</p>
                          <div className="flex items-center gap-2 text-emerald-700 font-bold pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>حضور و غیاب دانشجو در انتهای این جلسه ثبت خواهد شد.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Overview / Description */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-blue-600" />
                توضیحات و اهداف دوره
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-loose whitespace-pre-wrap">
                {cls.description}
              </div>
            </section>

            {/* Target Audience & Prerequisites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  این کلاس مناسب چه کسانی است؟
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>علاقه‌مندان به یادگیری تعاملی و تمرین پروژه در کلاس</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>افرادی که به تعامل مستقیم و پرسش و پاسخ با استاد نیاز دارند</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>داوطلبانی که به دنبال شبکه ارتباطی با هم‌دوره‌ای‌ها هستند</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  پیش‌نیازها و لوازم مورد نیاز
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>آشنایی با مبانی اولیه حوزه تخصصی</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>همراه داشتن لپ‌تاپ (برای جلسات حضوری و تمرین‌ها)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <span>تعهد به حضور منظم در جلسات طبق تقویم</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Instructor Card */}
            {instructor && (
              <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">درباره استاد کلاس</h2>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <img 
                    src={instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.firstName + ' ' + instructor.lastName)}`} 
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                    alt="" 
                  />
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{instructor.firstName} {instructor.lastName}</h3>
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
                      مدرس و متخصص ارشد
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {instructor.bio || 'دارای سال‌ها تجربه در آموزش تخصصی و هدایت پروژه‌های عملی و کارگاهی.'}
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>

          {/* Sidebar Column: Registration & Payment Mode */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sticky top-24 space-y-6">
              
              {/* Header Price */}
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 block mb-1">شهریه کلاس</span>
                <div className="text-3xl font-black text-slate-900">
                  {cls.price === 0 ? (
                    <span className="text-emerald-600">رایگان</span>
                  ) : (
                    <span>
                      {cls.price.toLocaleString('fa-IR')}{' '}
                      <span className="text-sm font-normal text-slate-500">تومان</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pre-Registration Option Picker */}
              {cls.price > 0 && cls.allowPreRegistration && (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block">نحوه پرداخت شهریه:</span>

                  <label 
                    onClick={() => setPaymentChoice('full')}
                    className={`p-3 rounded-xl border cursor-pointer block transition ${
                      paymentChoice === 'full'
                        ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentChoice === 'full'}
                          onChange={() => setPaymentChoice('full')}
                          className="text-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-900">پرداخت کامل</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {cls.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </label>

                  <label 
                    onClick={() => setPaymentChoice('deposit')}
                    className={`p-3 rounded-xl border cursor-pointer block transition ${
                      paymentChoice === 'deposit'
                        ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-2 ring-amber-500/20'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMode"
                          checked={paymentChoice === 'deposit'}
                          onChange={() => setPaymentChoice('deposit')}
                          className="text-amber-600"
                        />
                        <span className="text-xs font-bold text-amber-950">پیش‌ثبت‌نام با بیعانه</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-700">
                        {cls.preRegistrationDeposit?.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-800 pr-5">
                      مابقی شهریه ({(cls.price - (cls.preRegistrationDeposit || 0)).toLocaleString('fa-IR')} تومان) پس از جلسه {cls.remainingPaymentDueAfterSession || 2} تسویه خواهد شد.
                    </div>
                  </label>
                </div>
              )}

              {/* Capacity Progress */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">ظرفیت تکمیل شده:</span>
                  <span className="font-bold text-slate-900">{enrolled} از {cls.capacity} نفر</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-rose-500' : remaining <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (enrolled / cls.capacity) * 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-center text-slate-500">
                  {isFull ? 'ظرفیت این کلاس به پایان رسیده است' : `تنها ${remaining} ظرفیت خالی باقی مانده است`}
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ثبت و نظارت بر حضور و غیاب دانشجو در هر جلسه</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>دسترسی به بازپخش و فایل‌های ضبط شده</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ارتباط مستقیم با استاد در طول جلسات</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>گواهی شرکت در کارگاه پس از حد نصاب حضور</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAction}
                disabled={ctaDisabled || isPendingAction}
                className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${ctaClass} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isPendingAction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>درحال پردازش درخواست...</span>
                  </>
                ) : (
                  ctaText
                )}
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">
            {paymentChoice === 'deposit' && cls.allowPreRegistration ? 'مبلغ بیعانه پیش‌ثبت‌نام' : 'شهریه کلاس'}
          </span>
          <div className="text-base font-black text-slate-900">
            {cls.price === 0 ? 'رایگان' : (
              paymentChoice === 'deposit' && cls.allowPreRegistration
                ? `${cls.preRegistrationDeposit?.toLocaleString('fa-IR')} تومان`
                : `${cls.price.toLocaleString('fa-IR')} تومان`
            )}
          </div>
        </div>

        <button
          onClick={handleAction}
          disabled={ctaDisabled || isPendingAction}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${ctaClass} disabled:opacity-60`}
        >
          {isPendingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : ctaText}
        </button>
      </div>

    </div>
  );
}
