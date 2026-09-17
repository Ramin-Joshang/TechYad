'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Hero } from './Hero';
import { Intro } from './Intro';
import { Categories } from './Categories';
import { CourseList } from './CourseList';
import { InstructorGrid } from './InstructorGrid';
import { Advantages } from './Advantages';
import { Testimonials } from './Testimonials';
import { LatestArticles } from './LatestArticles';
import { CTA } from './CTA';

export function HomeDataView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['homeData'],
    queryFn: () => api.get('/home').then(res => res.data),
  });

  const d = data || {};

  return (
    <div className="min-h-screen flex flex-col bg-[var(--neo-bg)]">
      <Hero />
      <Intro />
      
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4 bg-[var(--neo-surface-2)]">
          <div className="w-10 h-10 border-4 border-[var(--neo-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--neo-text-muted)] font-bold text-sm">در حال دریافت اطلاعات...</p>
        </div>
      ) : error ? (
        <div className="py-32 flex items-center justify-center text-[var(--neo-error)] font-bold bg-[var(--neo-surface-2)]">خطا در برقراری ارتباط با سرور.</div>
      ) : (
        <>
          <Categories data={d.categories} />
          <CourseList title="دوره‌های پرطرفدار" sectionName="محبوب‌ترین‌ها" data={d.popularCourses} />
          <CourseList title="جدیدترین دوره‌ها" sectionName="تازه منتشر شده" data={d.newCourses} />
          <CourseList title="دوره‌های رایگان" sectionName="شروع بدون هزینه" data={d.freeCourses} />
          <InstructorGrid data={d.topInstructors} />
          <CourseList title="کلاس‌های زنده (Live)" sectionName="ارتباط مستقیم" data={d.onlineClasses} />
          <CourseList title="کلاس‌های حضوری" sectionName="یادگیری فیزیکی" data={d.inPersonClasses} />
        </>
      )}

      <Advantages />
      
      {!isLoading && !error && (
        <>
          <Testimonials data={d.testimonials} />
          <LatestArticles data={d.blogPosts || d.latestArticles} />
        </>
      )}
      
      <CTA />
    </div>
  );
}
