'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function AdminPendingCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => adminApi.getCourses().then(res => res.data?.data)
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishCourse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectCourse(id, 'رد شده توسط ادمین'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
  });

  const courses = coursesData?.courses || [];
  const pendingCourses = courses.filter((c: any) => c.status === 'pending');
  const filteredCourses = pendingCourses.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Activity className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">دوره‌های در انتظار بررسی</h1>
            <p className="text-gray-500 mt-1">تایید یا رد دوره‌های درخواست شده توسط اساتید</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
        ) : filteredCourses.length === 0 ? (
           <div className="p-12 text-center text-gray-500 font-medium">دوره‌ای برای بررسی وجود ندارد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-600 text-sm">عنوان دوره</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">استاد</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">تاریخ درخواست</th>
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
                    <td className="p-4 text-gray-600 text-sm font-medium">
                      {new Date(course.updatedAt || course.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => publishMutation.mutate(course._id)}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> تایید
                        </button>
                        <button 
                          onClick={() => rejectMutation.mutate(course._id)}
                          className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> رد
                        </button>
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
