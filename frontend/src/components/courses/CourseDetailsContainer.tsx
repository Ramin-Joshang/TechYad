'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { PlayCircle, FileText, CheckCircle, Clock, Book, User, Star, ChevronDown, ChevronUp, Lock, ShoppingCart, Loader2 } from 'lucide-react';
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
    queryFn: () => api.get(`/courses/${slug}`).then(res => res.data)
  });

  // Fetch Cart to check if item is in cart
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceApi.getCart().then(res => res.data),
    enabled: isAuthenticated && !isInitializing
  });

  
  // Check if enrolled
  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => api.get(`/learning/enrollments/${course._id}`).then(res => res.data).catch(() => null),
    enabled: isAuthenticated && !isInitializing && !!course?._id
  });
  const isEnrolled = !!enrollment;

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

  // Fetch Related Courses
  const { data: relatedCourses } = useQuery({
    queryKey: ['relatedCourses', course?._id],
    queryFn: () => api.get(`/courses/${course._id}/related`).then(res => res.data),
    enabled: !!course?._id
  });

  if (courseLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-[var(--neo-secondary)] animate-spin" /></div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">دوره پیدا نشد</div>;
  }

  const isFree = course.price === 0;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const instructor = course.instructors?.[0];
  const finalPrice = hasDiscount ? course.discountPrice : course.price;
  
  const isInCart = cartData?.items?.some((item: any) => item.itemId === course._id && item.itemType === 'course');

  const handleAddToCart = () => {
    if (isFree) {
      if (!isAuthenticated) {
         router.push(`/login?redirect=/courses/${slug}`);
         return;
      }
      // For now, redirect to student dashboard (real enrollment logic needed for free courses later)
      router.push('/student');
      return;
    }

    if (!isAuthenticated) {
      toast.error('برای خرید دوره ابتدا وارد حساب کاربری شوید');
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    if (isEnrolled) {
      router.push(`/student/courses`); // No /learn route yet maybe?
    } else if (!isInCart) {
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
                <div className="flex items-center gap-3 bg-white/5 rounded-full pr-1 pl-4 py-1 border border-white/10">
                  <img src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}&background=random`} alt="مدرس" className="w-10 h-10 rounded-full" />
                  <span className="font-medium text-white">{instructor.firstName} {instructor.lastName}</span>
                </div>
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
              
              <div className="mb-6 flex flex-col items-center justify-center">
                {isFree ? (
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
              
              <button 
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="w-full py-4 rounded-xl font-bold text-lg transition shadow-xl flex items-center justify-center gap-2
                  bg-[var(--neo-primary)] text-white hover:bg-blue-700 shadow-[var(--neo-primary)]/30 disabled:opacity-70"
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isEnrolled ? (
                  'شروع یادگیری'
                ) : isFree ? (
                  'شروع یادگیری (رایگان)'
                ) : isInCart ? (
                  <>
                    <CheckCircle className="w-6 h-6" /> مشاهده در سبد خرید
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" /> ثبت‌نام در دوره
                  </>
                )}
              </button>
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
             <CourseCurriculum courseId={course._id} />
           </div>
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
                 <div className="flex items-center gap-2 text-[var(--neo-text-secondary)]"><FileText className="w-4 h-4"/> پشتیبانی</div>
                 <span className="font-medium text-[var(--neo-text-main)]">دارد</span>
               </div>
             </div>
          </div>
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
function CourseCurriculum({ courseId }: { courseId: string }) {
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => api.get(`/courses/${courseId}/chapters`).then(res => res.data)
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
        <ChapterAccordion key={chapter._id} chapter={chapter} index={index + 1} />
      ))}
    </div>
  );
}

function ChapterAccordion({ chapter, index }: { chapter: any, index: number }) {
  const [isOpen, setIsOpen] = useState(index === 1);
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['lessons', chapter._id],
    queryFn: () => api.get(`/chapters/${chapter._id}/lessons`).then(res => res.data),
    enabled: isOpen
  });

  return (
    <div className="border border-[var(--neo-border)] rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-right transition-colors ${isOpen ? 'bg-[var(--neo-primary)]/5/50' : 'bg-white hover:bg-[var(--neo-bg)]'}`}
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
                    {lesson.isFree ? (
                      <button className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold hover:bg-emerald-200 transition">
                        پیش‌نمایش رایگان
                      </button>
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
  const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'نامشخص';

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden hover:shadow-2xl hover:shadow-[var(--neo-primary)]/10 transition duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)] p-2">
        <img src={course.thumbnail || `https://picsum.photos/seed/${course.slug}/400/250`} alt={course.title} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500" />
        <div className="absolute top-4 right-4 flex gap-2">
          {course.categoryId?.name && (
            <div className="bg-white/90 backdrop-blur text-[var(--neo-text-main)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {course.categoryId.name}
            </div>
          )}
        </div>
        {hasDiscount && !isFree && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {Math.round((1 - course.discountPrice / course.price) * 100)}% تخفیف
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-current" />
            <span>{course.averageRating || 'جدید'}</span>
          </div>
          {course.levelId?.name && (
             <span className="text-xs text-[var(--neo-primary)] bg-[var(--neo-primary)]/5 px-3 py-1.5 rounded-lg font-medium">{course.levelId.name}</span>
          )}
        </div>
        
        <h3 className="font-bold text-[var(--neo-text-main)] text-lg mb-2 line-clamp-2 group-hover:text-[var(--neo-primary)] transition leading-snug">{course.title}</h3>
        
        <div className="mt-auto pt-5 border-t border-gray-50 flex items-end justify-between">
          <div className="text-sm text-[var(--neo-text-muted)] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--neo-border)] overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${instructorName}&background=random`} alt="" className="w-full h-full object-cover" />
            </div>
            {instructorName}
          </div>
          <div className="font-bold text-lg text-left">
            {isFree ? (
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">رایگان</span>
            ) : (
              <div className="flex flex-col items-end">
                {hasDiscount ? (
                  <>
                    <span className="text-[var(--neo-text-muted)] text-xs line-through mb-0.5">{course.price.toLocaleString()}</span>
                    <span className="text-[var(--neo-primary)]">{course.discountPrice.toLocaleString()} <span className="text-xs text-[var(--neo-text-muted)] font-normal">تومان</span></span>
                  </>
                ) : (
                  <span className="text-[var(--neo-primary)]">{course.price.toLocaleString()} <span className="text-xs text-[var(--neo-text-muted)] font-normal">تومان</span></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
