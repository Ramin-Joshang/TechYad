'use client';

import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/features/learning/api/learning.api';
import { BookOpen, Search, Filter, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MyCoursesPage() {
  const [search, setSearch] = useState('');
  
  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: () => learningApi.getMyEnrollments().then(res => res.data)
  });

  const enrollments = enrollmentsData || [];
  
  const filteredCourses = enrollments.filter((e: any) => 
    e.courseId?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--neo-text-main)] mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[var(--neo-primary)]" />
            دوره‌های من
          </h1>
          <p className="text-[var(--neo-text-secondary)]">یادگیری خود را ادامه دهید و مهارت‌های جدید کسب کنید.</p>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] p-4 rounded-2xl shadow-sm border border-[var(--neo-border)] flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو در دوره‌های من..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:bg-[var(--neo-surface)] transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--neo-primary)] animate-spin mb-4" />
          <p className="text-[var(--neo-text-secondary)]">در حال بارگذاری دوره‌ها...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-16 text-center border border-[var(--neo-border)] shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">دوره‌ای یافت نشد</h3>
          <p className="text-[var(--neo-text-secondary)] mb-8 max-w-sm mx-auto">شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید و یا نتیجه‌ای برای جستجوی شما یافت نشد.</p>
          <Link href="/courses" className="bg-[var(--neo-primary)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--neo-primary)] transition shadow-lg shadow-[var(--neo-primary)]/20">
            مشاهده دوره‌های آموزشی
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment: any) => {
            const course = enrollment.courseId;
            if (!course) return null;
            
            return (
              <div key={enrollment._id} className="bg-[var(--neo-surface)] rounded-3xl overflow-hidden border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="relative aspect-video bg-[var(--neo-surface-2)]">
                  <img src={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/250`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/courses/${course.slug}`} className="bg-[var(--neo-surface)] text-[var(--neo-text-main)] px-6 py-2 rounded-full font-bold hover:bg-[var(--neo-primary)]/10 transition transform translate-y-4 group-hover:translate-y-0">
                      مشاهده دوره
                    </Link>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-[var(--neo-text-main)] mb-2 line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>
                  
                  <div className="mt-auto space-y-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-[var(--neo-text-main)]">میزان پیشرفت</span>
                      <span className="font-bold text-[var(--neo-primary)]">{enrollment.progress || 0}٪</span>
                    </div>
                    <div className="w-full bg-[var(--neo-surface-2)] rounded-full h-2 overflow-hidden">
                      <div className="bg-[var(--neo-primary)] h-2 rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
