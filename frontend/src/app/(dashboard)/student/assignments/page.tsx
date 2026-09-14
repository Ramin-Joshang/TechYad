'use client';

import { useQuery } from '@tanstack/react-query';
import { assignmentsApi } from '@/features/learning/api/assignments.api';
import { FileText, Search, Loader2, ArrowLeft, CheckCircle, Clock, FileWarning } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AssignmentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['myAssignments'],
    queryFn: () => assignmentsApi.getMyAssignments().then(res => res.data)
  });

  const assignments = assignmentsData || [];
  
  const filteredAssignments = assignments.filter((item: any) => {
    const matchesSearch = item.assignment?.title?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.submission;
    if (filter === 'submitted') return item.submission && item.submission.status !== 'graded';
    if (filter === 'graded') return item.submission && item.submission.status === 'graded';
    
    return true;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-amber-500" />
            تکالیف من
          </h1>
          <p className="text-gray-500">مدیریت و ارسال تکالیف دوره‌های آموزشی.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی تکلیف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>همه</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>در انتظار انجام</button>
          <button onClick={() => setFilter('submitted')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'submitted' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>ارسال شده</button>
          <button onClick={() => setFilter('graded')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'graded' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>تصحیح شده</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری تکالیف...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">تکلیفی یافت نشد</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">برای این وضعیت یا جستجو تکلیفی وجود ندارد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عنوان تکلیف</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">دوره آموزشی</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">مهلت ارسال</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">وضعیت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">نمره</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map((item: any) => {
                  const { assignment, submission } = item;
                  const isLate = assignment.deadline && new Date() > new Date(assignment.deadline) && !submission;
                  
                  return (
                    <tr key={assignment._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{assignment.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{assignment.lessonId?.title}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {assignment.courseId?.title}
                      </td>
                      <td className="py-4 px-6">
                        {assignment.deadline ? (
                          <span className={`text-sm ${isLate ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                            {new Date(assignment.deadline).toLocaleDateString('fa-IR')}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">بدون مهلت</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {!submission ? (
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isLate ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                             {isLate ? 'گذشت مهلت' : 'در انتظار انجام'}
                           </span>
                        ) : submission.status === 'graded' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> تصحیح شده
                          </span>
                        ) : submission.status === 'reviewing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                            <Clock className="w-3 h-3" /> در حال بررسی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            <FileWarning className="w-3 h-3" /> ارسال شده
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {submission?.status === 'graded' ? (
                          <span className="text-gray-900">{submission.score} <span className="text-xs text-gray-400 font-normal">/ {assignment.maxScore}</span></span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/student/assignments/${assignment._id}`} className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700 transition">
                          مشاهده
                          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
