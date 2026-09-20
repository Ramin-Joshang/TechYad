'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { coursesApi } from '@/features/courses/api/courses.api';
import { Loader2, Search, Mail, BookOpen } from 'lucide-react';

export default function InstructorStudentsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [page, setPage] = useState(1);

  // We need the list of courses first to populate the filter
  const { data: coursesData } = useQuery({
    queryKey: ['instructor-courses-list'],
    queryFn: () => coursesApi.getInstructorCourses({ limit: 100 }).then(res => res.data)
  });

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-students', selectedCourse, page],
    queryFn: async () => {
      // If "all", we might need a general endpoint or just fetch the first course
      // Let's use the first course if 'all' is selected since we only made getCourseStudents
      let courseId = selectedCourse;
      if (courseId === 'all' && coursesData?.courses?.[0]) {
        courseId = coursesData.courses[0]._id;
      }
      
      if (!courseId || courseId === 'all') return { students: [] };
      
      return api.get(`/instructor/courses/${courseId}/students`, { params: { page, limit: 10 } })
        .then(res => res.data);
    },
    enabled: selectedCourse !== 'all' || (!!coursesData?.courses && coursesData.courses.length > 0)
  });

  const displayCourseId = selectedCourse === 'all' && coursesData?.courses ? coursesData.courses[0]?._id : selectedCourse;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">دانشجویان من</h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">لیست دانشجویان ثبت‌نام شده در دوره‌های شما</p>
        </div>
        
        <div className="flex items-center gap-2 bg-[var(--neo-surface)] rounded-xl border border-[var(--neo-border)] p-2 shadow-sm">
          <BookOpen className="w-5 h-5 text-[var(--neo-text-muted)] ml-2" />
          <select
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); setPage(1); }}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-[var(--neo-text-main)] outline-none pr-8"
          >
            <option value="all">انتخاب دوره (پیش‌فرض: اولین دوره)</option>
            {coursesData?.courses?.map((course: any) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center text-[var(--neo-primary)]"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !data?.students?.length ? (
          <div className="p-12 text-center text-[var(--neo-text-secondary)] font-medium">هیچ دانشجویی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">دانشجو</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">ایمیل</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">تاریخ ثبت‌نام</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((enrollment: any) => (
                  <tr key={enrollment._id} className="border-b border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold overflow-hidden shrink-0">
                          {enrollment.userId?.avatar ? (
                            <img src={enrollment.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            enrollment.userId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="font-bold text-[var(--neo-text-main)]">
                          {enrollment.userId?.firstName} {enrollment.userId?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-[var(--neo-text-secondary)] dir-ltr text-right">
                      {enrollment.userId?.email}
                    </td>
                    <td className="p-4 font-medium text-[var(--neo-text-secondary)]">
                      {new Date(enrollment.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <a 
                          href={`mailto:${enrollment.userId?.email}`}
                          className="p-2 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] hover:bg-blue-100 rounded-lg transition-colors"
                          title="ارسال ایمیل"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {data?.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {[...Array(data?.pages || 0)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-colors ${
                  page === i + 1 ? 'bg-[var(--neo-primary)] text-white shadow-md' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] border border-[var(--neo-border)]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
