'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { 
  Loader2, Mail, BookOpen, GraduationCap, Users, 
  Layers, Search, CheckCircle, Clock, Video, MapPin, 
  Phone, Calendar, AlertCircle
} from 'lucide-react';

export default function InstructorStudentsPage() {
  const searchParams = useSearchParams();
  const initialItem = searchParams.get('course') || searchParams.get('item') || 'all';
  const [selectedItem, setSelectedItem] = useState<string>(initialItem);
  const [activeTab, setActiveTab] = useState<'all' | 'course' | 'class'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const itemParam = searchParams.get('course') || searchParams.get('item');
    if (itemParam) {
      setSelectedItem(itemParam);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-students', selectedItem, activeTab, page],
    queryFn: async () => {
      const res = await coursesApi.getInstructorStudents({ 
        item: selectedItem !== 'all' ? selectedItem : undefined,
        type: activeTab !== 'all' ? activeTab : undefined,
        page, 
        limit: 15 
      });
      return res.data;
    }
  });

  const students = data?.students || [];
  const courses = data?.courses || [];
  const classes = data?.classes || [];
  const stats = data?.stats || {
    totalStudents: 0,
    courseStudentsCount: 0,
    classStudentsCount: 0
  };

  // Client-side quick filter for search
  const filteredStudents = search.trim()
    ? students.filter((s: any) => {
        const query = search.trim().toLowerCase();
        const fullName = `${s.userId?.firstName || ''} ${s.userId?.lastName || ''}`.toLowerCase();
        const email = (s.userId?.email || '').toLowerCase();
        const itemTitle = (s.item?.title || s.courseId?.title || '').toLowerCase();
        return fullName.includes(query) || email.includes(query) || itemTitle.includes(query);
      })
    : students;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">دانشجویان و ثبت‌نامی‌ها</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">مدیریت و مشاهده تمامی دانشجویان ثبت‌نام شده در دوره‌ها و کلاس‌های شما</p>
            </div>
          </div>
        </div>
        
        {/* Dropdown for filtering by specific Course or Class */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-2 shadow-2xs self-stretch sm:self-auto">
          <Layers className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <select
            value={selectedItem}
            onChange={(e) => { setSelectedItem(e.target.value); setPage(1); }}
            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-bold text-slate-800 outline-none pr-6 cursor-pointer w-full"
          >
            <option value="all">همه دوره‌ها و کلاس‌ها</option>
            {courses.length > 0 && (
              <optgroup label="📚 دوره‌های آموزشی">
                {courses.map((c: any) => (
                  <option key={c._id} value={c._id}>دوره: {c.title}</option>
                ))}
              </optgroup>
            )}
            {classes.length > 0 && (
              <optgroup label="🏫 کلاس‌های تخصصی">
                {classes.map((cls: any) => (
                  <option key={cls._id} value={cls._id}>
                    کلاس: {cls.title} ({cls.mode === 'in_person' ? 'حضوری' : 'آنلاین'})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { setActiveTab('all'); setPage(1); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'all' 
              ? 'bg-indigo-600 text-white border-indigo-600' 
              : 'bg-white text-slate-800 border-[var(--neo-border)] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'all' ? 'text-indigo-100' : 'text-slate-400'}`}>کل دانشجویان شما</span>
            <Users className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            {(stats.totalStudents || data?.total || 0).toLocaleString('fa-IR')}
          </div>
          <div className={`text-[11px] mt-1 ${activeTab === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>
            مجموع دانشجویان دوره‌ها و کلاس‌ها
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab('course'); setPage(1); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'course' 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-slate-800 border-[var(--neo-border)] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'course' ? 'text-blue-100' : 'text-slate-400'}`}>دانشجویان دوره‌ها</span>
            <BookOpen className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            {(stats.courseStudentsCount || 0).toLocaleString('fa-IR')}
          </div>
          <div className={`text-[11px] mt-1 ${activeTab === 'course' ? 'text-blue-200' : 'text-slate-400'}`}>
            دوره‌های ویدیویی و سرفصل‌ها
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab('class'); setPage(1); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'class' 
              ? 'bg-emerald-600 text-white border-emerald-600' 
              : 'bg-white text-slate-800 border-[var(--neo-border)] hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${activeTab === 'class' ? 'text-emerald-100' : 'text-slate-400'}`}>دانشجویان کلاس‌ها</span>
            <GraduationCap className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            {(stats.classStudentsCount || 0).toLocaleString('fa-IR')}
          </div>
          <div className={`text-[11px] mt-1 ${activeTab === 'class' ? 'text-emerald-200' : 'text-slate-400'}`}>
            کلاس‌های زنده آنلاین و کارگاه‌های حضوری
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'همه ثبت‌نام‌ها' },
            { id: 'course', label: '📚 فقط دوره‌ها' },
            { id: 'class', label: '🏫 فقط کلاس‌ها' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی دانشجو، ایمیل یا نام دوره/کلاس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-indigo-600 gap-3">
            <Loader2 className="w-9 h-9 animate-spin" />
            <span className="text-xs font-bold text-slate-500">در حال بارگذاری لیست جامع دانشجویان...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-base text-slate-800">هیچ دانشجویی یافت نشد</h3>
            <p className="text-xs text-slate-400">فیلتر انتخاب شده را بررسی کنید یا عبارت جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">دانشجو</th>
                  <th className="p-4">نوع و عنوان آموزش</th>
                  <th className="p-4">وضعیت پرداخت و شهریه</th>
                  <th className="p-4">تاریخ ثبت‌نام</th>
                  <th className="p-4 text-center">تماس و عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((enrollment: any) => {
                  const student = enrollment.userId;
                  const item = enrollment.item || {};
                  const isClass = enrollment.type === 'class';
                  const isDeposit = enrollment.paymentType === 'deposit';

                  return (
                    <tr key={enrollment._id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Student Info */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-2xs border border-indigo-200">
                            {student?.avatar ? (
                              <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              student?.firstName?.charAt(0) || 'د'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {student?.firstName} {student?.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {student?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course / Class Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isClass ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                              item.mode === 'in_person'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {item.mode === 'in_person' ? <MapPin className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                              {item.mode === 'in_person' ? 'کلاس حضوری' : 'کلاس آنلاین'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <BookOpen className="w-3 h-3" />
                              دوره آموزشی
                            </span>
                          )}

                          <span className="font-bold text-slate-800 text-xs line-clamp-1">
                            {item.title || enrollment.courseId?.title || 'عنوان دوره/کلاس'}
                          </span>
                        </div>
                      </td>

                      {/* Payment & Fee Status */}
                      <td className="p-4 whitespace-nowrap">
                        {isClass ? (
                          isDeposit ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                                <Clock className="w-3 h-3" />
                                پیش‌ثبت‌نام (بیعانه)
                              </span>
                              <div className="text-[11px] text-slate-600 font-mono mt-1">
                                پرداختی: {(enrollment.depositAmount || enrollment.amount || 0).toLocaleString('fa-IR')} تومان
                              </div>
                              {enrollment.remainingBalance > 0 && !enrollment.remainingPaid && (
                                <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                                  مانده: {enrollment.remainingBalance.toLocaleString('fa-IR')} تومان
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                پرداخت کامل
                              </span>
                              <div className="text-[11px] text-slate-600 font-mono mt-1">
                                {(enrollment.amount || 0).toLocaleString('fa-IR')} تومان
                              </div>
                            </div>
                          )
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                              <CheckCircle className="w-3 h-3" />
                              دوره فعال ({enrollment.progress || 0}٪ پیشرفت)
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono mt-1">
                              شهریه: {(enrollment.amount || 0).toLocaleString('fa-IR')} تومان
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Enrolled Date */}
                      <td className="p-4 whitespace-nowrap text-slate-500">
                        <div className="font-medium text-[11px]">
                          {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {student?.email && (
                            <a 
                              href={`mailto:${student.email}`}
                              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition shadow-2xs"
                              title="ارسال ایمیل به دانشجو"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {student?.mobile && (
                            <a 
                              href={`tel:${student.mobile}`}
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition shadow-2xs"
                              title="تماس با دانشجو"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {(data?.pages || 1) > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/60 text-xs">
            <span className="text-slate-500 font-medium">
              صفحه {page.toLocaleString('fa-IR')} از {(data?.pages || 1).toLocaleString('fa-IR')}
            </span>
            <div className="flex gap-1.5">
              {[...Array(data?.pages || 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl font-bold transition-all ${
                    page === i + 1 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
