'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, CheckSquare } from 'lucide-react';

export default function AdminPublishedCoursesPage() {
  const [search, setSearch] = useState('');
  
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => adminApi.getCourses().then(res => res.data)
  });

  const courses = coursesData?.courses || [];
  const publishedCourses = courses.filter((c: any) => c.status === 'published');
  const filteredCourses = publishedCourses.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><CheckSquare className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">دوره‌های منتشر شده</h1>
            <p className="text-[var(--neo-text-secondary)] mt-1">نمایش دوره‌های فعال و در حال فروش</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filteredCourses.length === 0 ? (
           <div className="p-12 text-center text-[var(--neo-text-secondary)] font-medium">هیچ دوره فعالی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان دوره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">استاد</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">قیمت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">تاریخ انتشار</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course: any) => (
                  <tr key={course._id} className="border-b border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4 font-bold text-[var(--neo-text-main)]">{course.title}</td>
                    <td className="p-4 text-[var(--neo-text-secondary)] font-medium">
                      {course.instructors?.[0]?.firstName} {course.instructors?.[0]?.lastName}
                    </td>
                    <td className="p-4 text-[var(--neo-text-secondary)] font-medium">
                      {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}
                    </td>
                    <td className="p-4 text-[var(--neo-text-secondary)] text-sm font-medium">
                      {new Date(course.updatedAt || course.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
