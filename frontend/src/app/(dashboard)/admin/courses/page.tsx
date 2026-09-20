'use client';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, BookOpen, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => adminApi.getCourses().then(res => res.data)
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCourse(id),
    onSuccess: () => {
      toast.success('دوره با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectCourse(id, 'رد شده توسط ادمین'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
  });

  const courses = coursesData?.courses || [];
  const filteredCourses = courses.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت دوره‌ها</h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">نمایش و مدیریت وضعیت دوره‌های آموزشی</p>
        </div>
        <Link href="/instructor/courses/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:bg-[var(--neo-primary)] transition">
          <Plus className="w-5 h-5" />
          افزودن دوره جدید
        </Link>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی دوره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان دوره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">استاد</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">قیمت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">وضعیت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
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
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        course.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 
                        course.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]'
                      }`}>
                        {course.status === 'published' ? 'منتشر شده' : 
                         course.status === 'pending' ? 'در انتظار بررسی' :
                         course.status === 'rejected' ? 'رد شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link href={`/instructor/courses/${course._id}/edit`} className="p-2 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { if(window.confirm('آیا از حذف اطمینان دارید؟')) deleteMutation.mutate(course._id) }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {course.status !== 'published' && (
                          <button 
                            onClick={() => publishMutation.mutate(course._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="تایید و انتشار"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {course.status === 'pending' && (
                           <button 
                              onClick={() => rejectMutation.mutate(course._id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="رد کردن"
                            >
                              <XCircle className="w-4 h-4" />
                           </button>
                        )}
                      </div>
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
