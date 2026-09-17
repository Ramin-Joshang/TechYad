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
          <h1 className="text-2xl font-black text-gray-900">مدیریت دوره‌ها</h1>
          <p className="text-gray-500 mt-1">نمایش و مدیریت وضعیت دوره‌های آموزشی</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی دوره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-600 text-sm">عنوان دوره</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">استاد</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">قیمت</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">وضعیت</th>
                  <th className="p-4 font-bold text-gray-600 text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course: any) => (
                  <tr key={course._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{course.title}</td>
                    <td className="p-4 text-gray-600 font-medium">
                      {course.instructors?.[0]?.firstName} {course.instructors?.[0]?.lastName}
                    </td>
                    <td className="p-4 text-gray-600 font-medium">
                      {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        course.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 
                        course.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {course.status === 'published' ? 'منتشر شده' : 
                         course.status === 'pending' ? 'در انتظار بررسی' :
                         course.status === 'rejected' ? 'رد شده' : 'پیش‌نویس'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link href={`/instructor/courses/${course._id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { if(window.confirm('آیا از حذف اطمینان دارید؟')) deleteMutation.mutate(course._id) }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {course.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => publishMutation.mutate(course._id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="تایید و انتشار"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => rejectMutation.mutate(course._id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="رد کردن"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
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
