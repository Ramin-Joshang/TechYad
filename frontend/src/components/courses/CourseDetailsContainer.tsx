'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { PlayCircle, FileText, CheckCircle, Clock, Book, User, Star, ChevronDown, ChevronUp, Lock, ShoppingCart, Loader2, Play, GraduationCap, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import toast from 'react-hot-toast';

export function CourseDetailsContainer({ slug }: { slug: string }) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch Course
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api.get(`/courses/${slug}`).then((res: any) => res.data)
  });

  // Fetch Cart to check if item is in cart
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceApi.getCart().then((res: any) => res.data),
    enabled: isAuthenticated && !isInitializing
  });

  // Check if enrolled (purchased or enrolled in free course)
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => api.get(`/enrollments/${course._id}`, { headers: { 'X-Hide-Error-Toast': 'true' } }).then((res: any) => res.data).catch(() => null),
    enabled: isAuthenticated && !isInitializing && !!course?._id,
    staleTime: 1000 * 60 * 5,
  });

  const isEnrolled = !!enrollment;
  const isCheckingEnrollment = isAuthenticated && (enrollmentLoading || isInitializing);

  // Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: () => commerceApi.addToCart('course', course._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('دوره با موفقیت به سبد خرید اضافه شد');
      router.push('/cart');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در افزودن به سبد خرید');
    }
  });

  // Enroll in Free Course Mutation
  const enrollFreeMutation = useMutation({
    mutationFn: () => api.post(`/enrollments/free/${course._id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', course?._id] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      toast.success('شما با موفقیت در این دوره ثبت‌نام شدید');
      router.push('/student/courses');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'خطا در ثبت‌نام رایگان');
    }
  });

  // Fetch Related Courses
  const { data: relatedCourses } = useQuery({
    queryKey: ['relatedCourses', course?._id],
    queryFn: () => api.get(`/courses/${course._id}/related`).then((res: any) => res.data),
    enabled: !!course?._id
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-[var(--neo-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="bg-gray-200 h-80 rounded-3xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-200 h-10 w-1/3 rounded-xl"></div>
              <div className="bg-gray-200 h-48 rounded-2xl"></div>
            </div>
            <div className="bg-gray-200 h-64 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">دوره پیدا نشد</div>;
  }

  const isFree = course.price === 0;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const instructor = course.instructors?.[0];
  const finalPrice = hasDiscount ? course.discountPrice : course.price;
  
  const isInCart = cartData?.items?.some((item: any) => item.itemId === course._id && item.itemType === 'course');

  const handleAction = () => {
    if (isEnrolled) {
      router.push('/student/courses');
      return;
    }

    if (isFree) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/courses/${slug}`);
        return;
      }
      enrollFreeMutation.mutate();
      return;
    }

    if (!isAuthenticated) {
      toast.error('برای خرید دوره ابتدا وارد حساب کاربری شوید');
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (!isInCart) {
      addToCartMutation.mutate();
    } else {
      router.push('/cart');
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-[var(--neo-text-main)] text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700 via-gray-900 to-gray-900"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {course.categoryId?.name && (
                <span className="bg-[var(--neo-primary)]/20 text-blue-300 border border-[var(--neo-secondary)]/30 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  {course.categoryId.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-400/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-4 h-4 fill-current" />
                {course.averageRating || 'جدید'}
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-white">{course.title}</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              {instructor && (
                <Link 
                  href={`/instructors/${instructor._id}`}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition rounded-full pr-1.5 pl-4 py-1 border border-white/20 group cursor-pointer"
                  title="مشاهده رزومه و مشخصات استاد"
                >
                  <img 
                    src={instructor.personnelPhoto || instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.firstName + ' ' + instructor.lastName)}&background=0284c7&color=fff`} 
                    alt="مدرس" 
                    className="w-10 h-10 rounded-full object-cover border border-white/30" 
                  />
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-sm text-white group-hover:text-blue-300 transition">
                      {instructor.firstName} {instructor.lastName}
                    </span>
                    <span className="text-[10px] text-gray-300 group-hover:text-white transition">مشاهده رزومه استاد ←</span>
                  </div>
                </Link>
              )}
              <div className="flex items-center gap-2"><User className="w-5 h-5 text-[var(--neo-text-muted)]" /> {course.studentCount || 0} دانشجو</div>
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-[var(--neo-text-muted)]" /> آخرین بروزرسانی: {new Date(course.updatedAt).toLocaleDateString('fa-IR')}</div>
            </div>
          </div>
          
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="bg-white rounded-3xl p-6 shadow-2xl relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group cursor-pointer shadow-inner">
                <img src={course.thumbnail || `https://picsum.photos/seed/${course.slug}/800/450`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition duration-500">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition duration-300">
                    <PlayCircle className="w-10 h-10 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              {/* Pricing & Purchased Status */}
              <div className="mb-6 flex flex-col items-center justify-center">
                {isEnrolled ? (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full font-bold text-sm mb-2 border border-emerald-200">
                      <CheckCircle className="w-4 h-4" /> شما دانشجوی این دوره هستید
                    </div>
                    <p className="text-xs text-[var(--neo-text-muted)]">دسترسی کامل به ویدیوها و محتوای دوره فعال است</p>
                  </div>
                ) : isFree ? (
                  <div className="text-4xl font-black text-emerald-600 mb-2">رایگان</div>
                ) : (
                  <>
                    {hasDiscount && (
                      <div className="text-[var(--neo-text-muted)] line-through mb-1 text-lg">{course.price.toLocaleString('fa-IR')} تومان</div>
                    )}
                    <div className="text-4xl font-black text-[var(--neo-text-main)] mb-2">{finalPrice.toLocaleString('fa-IR')} <span className="text-xl text-[var(--neo-text-muted)] font-normal">تومان</span></div>
                  </>
                )}
              </div>
              
              {/* Primary Action Button: No Add to Cart when already enrolled */}
              {isCheckingEnrollment ? (
                <button 
                  disabled
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gray-100 text-gray-500 border border-gray-200 animate-pulse cursor-wait"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--neo-primary)]" />
                  <span>در حال بررسی وضعیت دوره...</span>
                </button>
              ) : isEnrolled ? (
                <button 
                  onClick={handleAction}
                  className="w-full py-4 rounded-xl font-bold text-lg transition shadow-xl flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                >
                  <Play className="w-5 h-5 fill-current" /> مشاهده دوره و شروع یادگیری
                </button>
              ) : isFree ? (
                <button 
                  onClick={handleAction}
                  disabled={enrollFreeMutation.isPending}
                  className="w-full py-4 rounded-xl font-bold text-lg transition shadow-xl flex items-center justify-center gap-2 bg-[var(--neo-primary)] text-white hover:bg-blue-700 shadow-[var(--neo-primary)]/30 disabled:opacity-70"
                >
                  {enrollFreeMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'شروع یادگیری (رایگان)'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-amber-500/10 text-amber-800 border border-amber-300 text-center select-none shadow-2xs">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>ثبت‌نام مستقیم دوره‌ها موقتاً غیرفعال است</span>
                  </div>
                  <p className="text-xs text-center text-gray-500 leading-relaxed">
                    جهت شرکت در کلاس‌های تعاملی آنلاین و کارگاه‌های تخصصی حضوری، لطفاً به بخش{' '}
                    <Link href="/classes" className="text-blue-600 font-bold hover:underline">
                      کلاس‌ها و کارگاه‌ها
                    </Link>{' '}
                    مراجعه فرمایید.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Content (Left on LTR, Right on RTL) */}
        <div className="lg:col-span-2 space-y-12">
           <div>
             <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
               <FileText className="w-6 h-6 text-[var(--neo-primary)]" /> معرفی دوره
             </h2>
             <div className="prose prose-lg prose-blue max-w-none text-[var(--neo-text-secondary)] leading-relaxed bg-[var(--neo-bg)] p-8 rounded-3xl" dangerouslySetInnerHTML={{ __html: course.content || '<p>توضیحات تکمیلی برای این دوره ثبت نشده است.</p>' }} />
           </div>

           <div>
             <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
               <Book className="w-6 h-6 text-[var(--neo-primary)]" /> سرفصل‌های دوره
             </h2>
             <CourseCurriculum courseId={course._id} isEnrolled={isEnrolled} />
           </div>

           {/* Instructor Profile & Resume Section */}
           {instructor && (
             <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--neo-border)] shadow-xs space-y-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--neo-border)] gap-2">
                 <h2 className="text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                   <GraduationCap className="w-6 h-6 text-[var(--neo-primary)]" />
                   مدرس این دوره
                 </h2>
                 <Link 
                   href={`/instructors/${instructor._id}`}
                   className="text-xs font-bold text-[var(--neo-primary)] hover:underline flex items-center gap-1 self-start sm:self-auto"
                 >
                   مشاهده صفحه کامل و رزومه استاد
                   <ChevronLeft className="w-4 h-4" />
                 </Link>
               </div>

               <div className="flex flex-col sm:flex-row gap-5 items-start">
                 <Link href={`/instructors/${instructor._id}`} className="shrink-0 group">
                   <img 
                     src={instructor.personnelPhoto || instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.firstName + " " + instructor.lastName)}&background=0284c7&color=fff`} 
                     alt={`${instructor.firstName} ${instructor.lastName}`}
                     className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-blue-100 shadow-sm group-hover:scale-105 transition duration-300"
                   />
                 </Link>

                 <div className="flex-1 space-y-2">
                   <div className="flex flex-wrap items-center justify-between gap-2">
                     <div>
                       <Link href={`/instructors/${instructor._id}`}>
                         <h3 className="text-lg font-bold text-[var(--neo-text-main)] hover:text-[var(--neo-primary)] transition">
                           {instructor.firstName} {instructor.lastName}
                         </h3>
                       </Link>
                       <p className="text-xs text-blue-600 font-medium mt-0.5">
                         {instructor.specialty || 'مدرس و متخصص ارشد تک‌یاد'}
                       </p>
                     </div>

                     <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                       مدرس تایید شده آکادمی
                     </span>
                   </div>

                   <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] leading-relaxed text-justify">
                     {instructor.bio || 'مدرس باسابقه و متخصص در حوزه آموزش‌های تخصصی و کاربردی در آکادمی تک‌یاد.'}
                   </p>

                   <div className="pt-2">
                     <Link 
                       href={`/instructors/${instructor._id}`}
                       className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--neo-primary)] hover:text-blue-800 transition bg-blue-50/80 hover:bg-blue-100 px-4 py-2 rounded-xl"
                     >
                       مشاهده رزومه کاری، سوابق تحصیلی و سایر دوره‌های استاد
                       <ChevronLeft className="w-4 h-4" />
                     </Link>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[var(--neo-bg)] rounded-3xl p-8 border border-[var(--neo-border)]">
             <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-6">اطلاعات دوره</h3>
             <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-[var(--neo-border)]">
                 <div className="flex items-center gap-2 text-[var(--neo-text-secondary)]"><Clock className="w-4 h-4"/> مدت زمان</div>
                 <span className="font-medium text-[var(--neo-text-main)]">{course.totalDuration ? Math.floor(course.totalDuration / 60) + ' ساعت' : 'نامشخص'}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-[var(--neo-border)]">
                 <div className="flex items-center gap-2 text-[var(--neo-text-secondary)]"><Book className="w-4 h-4"/> تعداد ویدیوها</div>
                 <span className="font-medium text-[var(--neo-text-main)]">{course.totalLessons || 0}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-[var(--neo-border)]">
                 <div className="flex items-center gap-2 text-[var(--neo-text-secondary)]"><CheckCircle className="w-4 h-4"/> سطح دوره</div>
                 <span className="font-medium text-[var(--neo-text-main)]">{course.levelId?.name || 'همه سطوح'}</span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <div className="flex items-center gap-2 text-[var(--neo-text-secondary)]"><FileText className="w-4 h-4"/> وضعیت خرید</div>
                 <span className={`font-bold ${isEnrolled ? 'text-emerald-600' : 'text-[var(--neo-text-main)]'}`}>
                   {isEnrolled ? 'خریداری شده' : isFree ? 'رایگان' : 'نیازمند ثبت‌نام'}
                 </span>
               </div>
             </div>
          </div>

          {/* Instructor Quick Sidebar Card */}
          {instructor && (
            <div className="bg-[var(--neo-bg)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
              <h4 className="text-sm font-bold text-[var(--neo-text-muted)]">مدرس دوره</h4>
              <div className="flex items-center gap-3">
                <img 
                  src={instructor.personnelPhoto || instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.firstName + " " + instructor.lastName)}&background=0284c7&color=fff`} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-sm text-[var(--neo-text-main)] line-clamp-1">{instructor.firstName} {instructor.lastName}</h5>
                  <p className="text-xs text-[var(--neo-text-muted)] line-clamp-1">{instructor.specialty || 'مدرس ارشد تک‌یاد'}</p>
                </div>
              </div>
              <Link 
                href={`/instructors/${instructor._id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-[var(--neo-border)] rounded-xl text-xs font-bold text-[var(--neo-text-main)] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition shadow-2xs"
              >
                <span>مشاهده رزومه استاد</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

      </div>
      
      {/* Related Courses */}
      {relatedCourses && relatedCourses.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-[var(--neo-border)] pt-16">
          <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-8">دوره‌های مرتبط</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedCourses.map((rc: any) => (
              <CourseCard key={rc._id} course={rc} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// Child component to fetch and render Chapters and Lessons
function CourseCurriculum({ courseId, isEnrolled }: { courseId: string; isEnrolled: boolean }) {
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => api.get(`/courses/${courseId}/chapters`).then((res: any) => res.data)
  });

  if (chaptersLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[var(--neo-surface-2)] rounded-xl"></div>)}
    </div>;
  }

  if (!chapters || chapters.length === 0) {
    return <div className="text-[var(--neo-text-muted)] text-center py-8 bg-[var(--neo-bg)] rounded-xl">سرفصلی برای این دوره ثبت نشده است.</div>;
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter: any, index: number) => (
        <ChapterAccordion key={chapter._id} chapter={chapter} index={index + 1} isEnrolled={isEnrolled} />
      ))}
    </div>
  );
}

function ChapterAccordion({ chapter, index, isEnrolled }: { chapter: any; index: number; isEnrolled: boolean }) {
  const [isOpen, setIsOpen] = useState(index === 1);
  
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', chapter._id],
    queryFn: () => api.get(`/chapters/${chapter._id}/lessons`).then((res: any) => res.data),
    enabled: isOpen
  });

  return (
    <div className="border border-[var(--neo-border)] rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-right transition-colors ${isOpen ? 'bg-[var(--neo-primary)]/5' : 'bg-white hover:bg-[var(--neo-bg)]'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isOpen ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface-2)] text-[var(--neo-text-muted)]'}`}>
            {index}
          </div>
          <div>
            <h3 className="font-bold text-[var(--neo-text-main)] text-lg">{chapter.title}</h3>
            {chapter.description && <p className="text-sm text-[var(--neo-text-muted)] mt-1">{chapter.description}</p>}
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-[var(--neo-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--neo-text-muted)]" />}
      </button>

      {isOpen && (
        <div className="bg-white p-4 border-t border-[var(--neo-border)]">
          {isLoading ? (
            <div className="py-4 flex justify-center"><Loader2 className="w-6 h-6 text-[var(--neo-text-muted)] animate-spin" /></div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="py-4 text-center text-sm text-[var(--neo-text-muted)]">جلسه‌ای یافت نشد.</div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson: any, i: number) => (
                <div key={lesson._id} className="flex justify-between items-center p-4 rounded-xl hover:bg-[var(--neo-bg)] group transition border border-transparent hover:border-[var(--neo-border)]">
                  <div className="flex items-center gap-3">
                    {lesson.type === 'video' ? <PlayCircle className="w-5 h-5 text-[var(--neo-secondary)]" /> : <FileText className="w-5 h-5 text-amber-500" />}
                    <span className="text-[var(--neo-text-secondary)] font-medium group-hover:text-blue-700 transition">{i + 1}. {lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isEnrolled || lesson.isFree ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
                        {isEnrolled ? 'در دسترس' : 'پیش‌نمایش رایگان'}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-[var(--neo-text-muted)]" />
                    )}
                    {lesson.video?.duration && (
                      <span className="text-xs font-mono text-[var(--neo-text-muted)] w-12 text-left bg-[var(--neo-surface-2)] px-2 py-1 rounded">
                        {Math.floor(lesson.video.duration / 60)}:{String(lesson.video.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const isFree = course.price === 0;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const instructor = course.instructors?.[0];

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:shadow-lg transition">
      <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
        <img src={course.thumbnail || `https://picsum.photos/seed/${course.slug}/400/250`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="font-bold text-[var(--neo-text-main)] mb-2 line-clamp-1">{course.title}</h4>
        <div className="text-xs text-[var(--neo-text-muted)] mb-3">
          {instructor ? `${instructor.firstName} ${instructor.lastName}` : 'مدرس تک‌یاد'}
        </div>
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-[var(--neo-primary)]">
          <span>{isFree ? 'رایگان' : `${(hasDiscount ? course.discountPrice : course.price).toLocaleString()} تومان`}</span>
          <span className="text-xs text-[var(--neo-text-secondary)] font-normal">مشاهده ←</span>
        </div>
      </div>
    </Link>
  );
}
