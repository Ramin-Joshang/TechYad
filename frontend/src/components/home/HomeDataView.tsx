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
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--neo-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--neo-muted)] font-bold tracking-widest font-en uppercase text-sm">Loading Knowledge Network...</p>
        </div>
      ) : error ? (
        <div className="py-32 flex items-center justify-center text-red-500 font-bold">Error connecting to network.</div>
      ) : (
        <>
          <Categories data={d.categories} />
          <CourseList title="Popular Courses" sectionId="02" data={d.popularCourses} />
          <CourseList title="New Releases" sectionId="03" data={d.newCourses} />
          <CourseList title="Free Access" sectionId="04" data={d.freeCourses} />
          <InstructorGrid data={d.topInstructors} />
          <CourseList title="Live Sessions" sectionId="06" data={d.onlineClasses} />
          <CourseList title="In-Person Classes" sectionId="07" data={d.inPersonClasses} />
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
