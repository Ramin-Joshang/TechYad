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
      {/* 1. Hero */}
      <Hero />

      {/* 2. Platform Advantages & Intro */}
      <Intro />
      <Advantages />
      
      {/* 3. Classes (Online & In-person) */}
      <CourseList 
        title="کلاس‌های آنلاین و زنده (Live)" 
        sectionName="تعامل مستقیم با اساتید" 
        data={d.onlineClasses} 
        isLoading={isLoading} 
      />

      <CourseList 
        title="کارگاه‌ها و کلاس‌های حضوری" 
        sectionName="یادگیری عملی در محیط فیزیکی" 
        data={d.inPersonClasses} 
        isLoading={isLoading} 
      />

      {/* 4. Courses (Popular, New, Free) */}
      <CourseList 
        title="دوره‌های پرطرفدار و تخصصی" 
        sectionName="محبوب‌ترین دوره‌های پلتفرم" 
        data={d.popularCourses} 
        isLoading={isLoading} 
      />

      <CourseList 
        title="جدیدترین دوره‌های آموزشی" 
        sectionName="تازه منتشر شده" 
        data={d.newCourses} 
        isLoading={isLoading} 
      />

      <CourseList 
        title="دوره‌های رایگان" 
        sectionName="شروع یادگیری بدون هزینه" 
        data={d.freeCourses} 
        isLoading={isLoading} 
      />

      {/* 5. Hierarchical Categories Section */}
      <Categories data={d.categories} isLoading={isLoading} />

      {/* 6. Top Instructors */}
      <InstructorGrid data={d.topInstructors} isLoading={isLoading} />

      {/* 7. Student Testimonials */}
      <Testimonials data={d.testimonials} isLoading={isLoading} />

      {/* 8. Latest Articles / Blog */}
      <LatestArticles data={d.blogPosts || d.latestArticles} isLoading={isLoading} />
      
      {/* 9. Final Call to Action */}
      <CTA />
    </div>
  );
}
