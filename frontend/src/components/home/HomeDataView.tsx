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

export function HomeDataView({ initialData }: { initialData?: any }) {
  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['homeData'],
    queryFn: () => api.get('/home').then(res => res.data),
    initialData: initialData,
  });

  const d = data || initialData || {};
  const isLoading = !d || Object.keys(d).length === 0 ? queryLoading : false;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[var(--neo-bg)] w-full overflow-x-hidden text-right">
      <Hero />
      <Intro />
      
      {/* Categories Section */}
      <Categories data={d.categories} isLoading={isLoading} />

      {/* Popular Courses */}
      <CourseList 
        title="دوره‌های پرطرفدار" 
        sectionName="محبوب‌ترین‌ها" 
        data={d.popularCourses} 
        isLoading={isLoading} 
      />

      {/* New Courses */}
      <CourseList 
        title="جدیدترین دوره‌ها" 
        sectionName="تازه منتشر شده" 
        data={d.newCourses} 
        isLoading={isLoading} 
      />

      {/* Free Courses */}
      <CourseList 
        title="دوره‌های رایگان" 
        sectionName="شروع بدون هزینه" 
        data={d.freeCourses} 
        isLoading={isLoading} 
      />

      {/* Top Instructors */}
      <InstructorGrid data={d.topInstructors} isLoading={isLoading} />

      {/* Online Classes */}
      <CourseList 
        title="کلاس‌های زنده (Live)" 
        sectionName="ارتباط مستقیم" 
        data={d.onlineClasses} 
        isLoading={isLoading} 
      />

      {/* In-person Classes */}
      <CourseList 
        title="کلاس‌های حضوری" 
        sectionName="یادگیری فیزیکی" 
        data={d.inPersonClasses} 
        isLoading={isLoading} 
      />

      <Advantages />
      
      {/* Testimonials */}
      <Testimonials data={d.testimonials} isLoading={isLoading} />

      {/* Latest Articles */}
      <LatestArticles data={d.blogPosts || d.latestArticles} isLoading={isLoading} />
      
      <CTA />
    </div>
  );
}
