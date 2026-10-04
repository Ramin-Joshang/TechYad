'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  X, Award, Users, Search, Save, Loader2, CheckCircle2, 
  AlertCircle, TrendingUp, BookOpen, Clock, FileText, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClassGradebookModalProps {
  classItem: any;
  onClose: () => void;
}

export function ClassGradebookModal({ classItem, onClose }: ClassGradebookModalProps) {
  const queryClient = useQueryClient();
  const classId = classItem._id;
  const [search, setSearch] = useState('');
  const [gradesMap, setGradesMap] = useState<Record<string, { finalGrade: number | ''; evaluationNote: string }>>({});

  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['classStudents', classId],
    queryFn: async () => {
      const res = await classesApi.getClassStudents(classId);
      const list = res.data || [];
      // Initialize gradesMap
      const initialMap: Record<string, { finalGrade: number | ''; evaluationNote: string }> = {};
      list.forEach((item: any) => {
        const studentId = item.user?._id || item.user;
        if (studentId) {
          initialMap[studentId] = {
            finalGrade: typeof item.finalGrade === 'number' ? item.finalGrade : '',
            evaluationNote: item.evaluationNote || ''
          };
        }
      });
      setGradesMap(initialMap);
      return list;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = Object.entries(gradesMap).map(([userId, val]) => ({
        userId,
        finalGrade: val.finalGrade === '' ? 0 : Number(val.finalGrade),
        evaluationNote: val.evaluationNote
      }));
      return classesApi.updateClassGrades(classId, payload);
    },
    onSuccess: () => {
      toast.success('کارنامه و نمرات دانشجویان با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['classStudents', classId] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت نمرات');
    }
  });

  const handleGradeChange = (userId: string, val: string) => {
    // Convert Persian numbers
    const cleanNum = val
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[^0-9.]/g, '');
    const num = cleanNum === '' ? '' : Math.min(100, Math.max(0, Number(cleanNum)));
    setGradesMap(prev => ({
      ...prev,
      [userId]: {
        finalGrade: num,
        evaluationNote: prev[userId]?.evaluationNote || ''
      }
    }));
  };

  const handleNoteChange = (userId: string, note: string) => {
    setGradesMap(prev => ({
      ...prev,
      [userId]: {
        finalGrade: prev[userId]?.finalGrade ?? '',
        evaluationNote: note
      }
    }));
  };

  const filteredStudents = students.filter((item: any) => {
    const fullName = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase();
    const email = (item.user?.email || '').toLowerCase();
    const mobile = (item.user?.mobile || '');
    const q = search.toLowerCase();
    return fullName.includes(q) || email.includes(q) || mobile.includes(q);
  });

  // Calculate statistics
  const totalHeldSessions = students[0]?.totalHeldSessions || 1;
  const gradedCount = Object.values(gradesMap).filter(g => typeof g.finalGrade === 'number' && g.finalGrade > 0).length;
  const totalScores = Object.values(gradesMap)
    .filter(g => typeof g.finalGrade === 'number' && g.finalGrade > 0)
    .reduce((acc, curr) => acc + Number(curr.finalGrade), 0);
  const averageScore = gradedCount > 0 ? (totalScores / gradedCount).toFixed(1) : '۰';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">کارنامه دسته‌جمعی و ثبت نمرات کلاس</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {classItem.title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                بررسی میزان حضور در جلسات، ثبت نمره نهایی و ارزیابی کیفی برای هر دانشجو
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats and Search bar */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-bold">دانشجویان</span>
              <strong className="text-sm text-slate-800">{students.length} نفر</strong>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-bold">نمره‌گذاری‌شده</span>
              <strong className="text-sm text-indigo-600">{gradedCount} نفر</strong>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 block font-bold">میانگین کلاس</span>
              <strong className="text-sm text-emerald-600">{averageScore} / ۱۰۰</strong>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجوی نام دانشجو..."
              className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Students Grade Table / List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs text-slate-500 font-bold">در حال بارگذاری لیست دانشجویان...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">دانشجویی در این کلاس یافت نشد</p>
            </div>
          ) : (
            filteredStudents.map((item: any) => {
              const u = item.user || {};
              const studentId = u._id || u;
              const attended = item.attendedSessionsCount || 0;
              const totalHeld = item.totalHeldSessions || totalHeldSessions || 1;
              const attendanceRate = totalHeld > 0 ? Math.round((attended / totalHeld) * 100) : 100;
              const gradeState = gradesMap[studentId] || { finalGrade: '', evaluationNote: '' };

              return (
                <div 
                  key={studentId} 
                  className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(u.firstName?.[0] || 'د')}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {u.firstName || ''} {u.lastName || 'دانشجو'}
                      </h4>
                      <p className="text-[11px] text-slate-400 dir-ltr text-right">
                        {u.mobile || u.email || 'بدون ایمیل'}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Stats badge */}
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600">
                      حضور: <strong>{attended}</strong> از {totalHeld} جلسه
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      attendanceRate >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      attendanceRate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {attendanceRate}٪
                    </span>
                  </div>

                  {/* Grade Input & Feedback */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Score */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-bold text-slate-600 whitespace-nowrap">نمره (۰-۱۰۰):</label>
                      <input 
                        type="text"
                        inputMode="numeric"
                        value={gradeState.finalGrade}
                        onChange={e => handleGradeChange(studentId, e.target.value)}
                        placeholder="نمره..."
                        className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold text-xs text-indigo-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    {/* Note */}
                    <div className="flex-1 w-full sm:w-auto min-w-0 sm:min-w-[200px]">
                      <input 
                        type="text"
                        value={gradeState.evaluationNote}
                        onChange={e => handleNoteChange(studentId, e.target.value)}
                        placeholder="نظر استاد / بازخورد عملکرد..."
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:block">
            نمرات ثبت‌شده در کارنامه شخصی دانشجو (`/student/grades`) منعکس خواهد شد.
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              بستن
            </button>

            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ثبت و انتشار نمرات
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
