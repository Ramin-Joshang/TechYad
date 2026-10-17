'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Hero } from './Hero';
import { Intro } from './Intro';
import { Categories } from './Categories';
import { SnappPayBanner } from './SnappPayBanner';
import { PurchaseGuideSection } from './PurchaseGuideSection';
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
      
      {/* 3. Featured Classes & Workshops (All published classes up to 12 items) */}
      <CourseList 
        title="کلاس‌ها و کارگاه‌های تخصصی آکادمی تک‌یاد" 
        sectionName="تعامل مستقیم با اساتید و ظرفیت محدود" 
        data={d.featuredClasses || d.inPersonClasses} 
        isLoading={isLoading} 
      />

      {/* Online Live Classes */}
      {d.onlineClasses && d.onlineClasses.length > 0 && (
        <CourseList 
          title="کلاس‌های آنلاین و زنده (Live)" 
          sectionName="آموزش تعاملی مجازی" 
          data={d.onlineClasses} 
          isLoading={isLoading} 
        />
      )}

      {/* In-Person Workshops */}
      {d.inPersonClasses && d.inPersonClasses.length > 0 && (
        <CourseList 
          title="کارگاه‌ها و کلاس‌های حضوری" 
          sectionName="یادگیری عملی در محیط فیزیکی" 
          data={d.inPersonClasses} 
          isLoading={isLoading} 
        />
      )}

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

      {/* 5. SnappPay 4-Installment Promotion Banner */}
      <SnappPayBanner />

      {/* 5.1. Transparent Purchase & Payment Guide Section */}
      <PurchaseGuideSection />

      {/* 6. Hierarchical Categories Section ("گسترش مرزهای دانش") */}
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
