'use client';

import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '@/features/learning/api/quizzes.api';
import { Target, Search, Loader2, ArrowLeft, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function QuizzesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const { data: quizzesData, isLoading } = useQuery({
    queryKey: ['myQuizzes'],
    queryFn: () => quizzesApi.getMyQuizzes().then(res => res.data)
  });

  const quizzes = quizzesData || [];
  
  const filteredQuizzes = quizzes.filter((item: any) => {
    const matchesSearch = item.quiz?.title?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.attempt || item.attempt.status === 'in_progress';
    if (filter === 'completed') return item.attempt && item.attempt.status === 'submitted';
    
    return true;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-rose-500" />
            آزمون‌های من
          </h1>
          <p className="text-gray-500">ارزیابی‌ها و آزمون‌های دوره‌های ثبت‌نام شده.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی آزمون..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>همه</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'pending' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>آزمون‌های باز</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${filter === 'completed' ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>انجام شده</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری آزمون‌ها...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Target className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">آزمونی یافت نشد</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">شما در حال حاضر آزمونی برای انجام ندارید.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عنوان آزمون</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">دوره آموزشی</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">تعداد سوال</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">زمان</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">وضعیت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">نمره</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuizzes.map((item: any) => {
                  const { quiz, attempt } = item;
                  const isCompleted = attempt?.status === 'submitted';
                  
                  return (
                    <tr key={quiz._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{quiz.title}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {quiz.courseId?.title}
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium">
                        {quiz.questions?.length || 0} سوال
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                           <Clock className="w-4 h-4 text-gray-400" />
                           {quiz.duration ? `${quiz.duration} دقیقه` : 'نامحدود'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isCompleted ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                             <CheckCircle2 className="w-3 h-3" /> انجام شده
                           </span>
                        ) : attempt ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                             <Clock className="w-3 h-3" /> در حال انجام
                           </span>
                        ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                             شروع نشده
                           </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {isCompleted ? (
                          <span className={`${attempt.percentage >= (quiz.passingScore || 0) ? 'text-emerald-600' : 'text-red-600'}`}>
                            {attempt.percentage}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/student/quizzes/${quiz._id}`} className={`inline-flex items-center gap-1 text-sm font-bold transition ${isCompleted ? 'text-gray-500 hover:text-gray-800' : 'text-rose-600 hover:text-rose-700'}`}>
                          {isCompleted ? 'مشاهده نتیجه' : 'شروع آزمون'}
                          {isCompleted ? <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> : <PlayCircle className="w-4 h-4" />}
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
