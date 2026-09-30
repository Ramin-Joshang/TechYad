'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Loader2, Search, Video, Calendar, Users, Plus, Edit, Trash2, 
  MapPin, ClipboardCheck, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AttendanceModal } from '@/components/classes/AttendanceModal';
import { ClassFormModal } from '@/components/classes/ClassFormModal';
import { ClassSessionsModal } from '@/components/classes/ClassSessionsModal';
import { ClassGradebookModal } from '@/components/classes/ClassGradebookModal';

export default function InstructorClassesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<any | null>(null);
  const [sessionsClass, setSessionsClass] = useState<any | null>(null);
  const [gradebookClass, setGradebookClass] = useState<any | null>(null);

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['instructor-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/instructor/classes', data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      setIsFormOpen(false);
      setEditingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کلاس');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/instructor/classes/${editingClass?._id}`, data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      setIsFormOpen(false);
      setEditingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش کلاس');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/instructor/classes/${id}`),
    onSuccess: () => {
      toast.success('کلاس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کلاس');
    }
  });

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingClass) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const classes = classesData?.classes || (Array.isArray(classesData) ? classesData : []);
  const filteredClasses = classes.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">مدیریت کلاس‌ها و کارگاه‌ها</h1>
            <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">
              برنامه‌ریزی، سرفصل‌ها، پیش‌نیازها، پیش‌ثبت‌نام بیعانه و حضور و غیاب دانشجوها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در کلاس‌ها..."
              className="w-full pr-9 pl-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button 
            onClick={handleCreate} 
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" /> تعریف کلاس جدید
          </button>
        </div>
      </div>

      {/* Classes Cards List */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span>درحال دریافت کلاس‌های شما...</span>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-16 bg-white rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 font-medium space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">کلاسی یافت نشد</h3>
          <p className="text-xs text-slate-400">می‌توانید با دکمه «تعریف کلاس جدید» اولین کلاس آنلاین یا حضوری خود را با سرفصل و تقویم راه‌اندازی نمایید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls: any) => {
            const isOnline = cls.mode === 'online';
            const enrolled = cls.enrolledCount || 0;

            return (
              <div 
                key={cls._id} 
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs flex flex-col hover:shadow-md transition-all relative group"
              >
                {/* Quick actions hover buttons */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-slate-200">
                  <button 
                    onClick={() => handleEdit(cls)} 
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" 
                    title="ویرایش مشخصات کامل کلاس"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { 
                      if(window.confirm('آیا از حذف این کلاس اطمینان دارید؟')) deleteMutation.mutate(cls._id); 
                    }} 
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" 
                    title="حذف کلاس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnail banner */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <img 
                    src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/600/350`} 
                    alt={cls.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs backdrop-blur-md flex items-center gap-1 text-white ${
                      isOnline ? 'bg-blue-600/90' : 'bg-emerald-600/90'
                    }`}>
                      {isOnline ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {isOnline ? 'آنلاین' : 'حضوری'}
                    </span>
                    {cls.allowPreRegistration && (
                      <span className="bg-amber-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-md shadow-xs">
                        بیعانه‌ای ({cls.preRegistrationDeposit?.toLocaleString('fa-IR')} ت)
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5 line-clamp-1 group-hover:text-emerald-600 transition">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {cls.shortDescription || cls.description || 'توضیحات تکمیلی برای این کلاس ثبت نشده است.'}
                    </p>
                  </div>

                  {/* Schedule Details box */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {cls.scheduleDays?.length ? cls.scheduleDays.join('، ') : 'روزهای زوج'}
                        {cls.scheduleTime ? ` (${cls.scheduleTime})` : ''}
                      </span>
                    </div>

                    {isOnline ? (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">پلتفرم: {cls.meetingPlatform || 'اسکای‌روم'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">{cls.city || 'تهران'} - {cls.address || 'محل اعلامی'}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span>سرفصل: <strong>{cls.syllabus?.length || cls.sessions || 10} جلسه</strong></span>
                      <span>دانشجویان: <strong>{enrolled} نفر</strong></span>
                    </div>
                  </div>

                  {/* Attendance, Sessions, Gradebook & Class Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Primary Button: Take Attendance */}
                    <button
                      onClick={() => setAttendanceClass(cls)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      حضور و غیاب دانشجوها ({enrolled} نفر)
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Manage Sessions & Online Links */}
                      <button
                        onClick={() => setSessionsClass(cls)}
                        className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-blue-200/60"
                        title="مدیریت لینک‌های آنلاین و وضعیت برگزاری جلسات"
                      >
                        <Video className="w-3.5 h-3.5" />
                        جلسات و لینک‌ها
                      </button>

                      {/* Class Gradebook & Student Scores */}
                      <button
                        onClick={() => setGradebookClass(cls)}
                        className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-indigo-200/60"
                        title="مشاهده کارنامه دسته‌جمعی و ثبت نمرات کلاس"
                      >
                        <Users className="w-3.5 h-3.5" />
                        کارنامه و نمرات
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link 
                        href={`/classes/${cls.slug || cls._id}`} 
                        className="text-center py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        صفحه عمومی
                      </Link>

                      {isOnline && cls.meetingLink ? (
                        <a 
                          href={cls.meetingLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-center py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-emerald-200"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          ورود مستقیم
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleEdit(cls)}
                          className="text-center py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                          ویرایش کامل
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unified Class Form Modal */}
      {isFormOpen && (
        <ClassFormModal
          isOpen={isFormOpen}
          initialData={editingClass}
          title={editingClass ? `ویرایش کلاس: ${editingClass.title}` : 'تعریف کلاس جدید (آنلاین یا حضوری)'}
          onClose={() => { setIsFormOpen(false); setEditingClass(null); }}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          isAdmin={false}
        />
      )}

      {/* Attendance Modal */}
      {attendanceClass && (
        <AttendanceModal
          classItem={attendanceClass}
          onClose={() => setAttendanceClass(null)}
          isAdmin={false}
        />
      )}

      {/* Sessions & Online Meeting Links Modal */}
      {sessionsClass && (
        <ClassSessionsModal
          classItem={sessionsClass}
          onClose={() => setSessionsClass(null)}
        />
      )}

      {/* Class Gradebook & Student Scores Modal */}
      {gradebookClass && (
        <ClassGradebookModal
          classItem={gradebookClass}
          onClose={() => setGradebookClass(null)}
        />
      )}

    </div>
  );
}
