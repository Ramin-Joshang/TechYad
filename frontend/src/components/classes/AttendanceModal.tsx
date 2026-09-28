'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  X, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Save, Loader2, Users, Calendar, Award, Check, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AttendanceModalProps {
  classItem: any;
  onClose: () => void;
  isAdmin?: boolean;
}

export function AttendanceModal({ classItem, onClose, isAdmin = false }: AttendanceModalProps) {
  const queryClient = useQueryClient();
  const classId = classItem._id;
  const totalSessions = classItem.sessions || 10;

  const [activeTab, setActiveTab] = useState<'take' | 'report'>('take');
  const [selectedSession, setSelectedSession] = useState<number>(1);
  const [sessionTitle, setSessionTitle] = useState<string>('جلسه ۱');
  const [records, setRecords] = useState<Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; note: string }>>({});

  // Fetch Attendance data for this class
  const { data: attendanceData, isLoading, refetch } = useQuery({
    queryKey: ['classAttendance', classId],
    queryFn: async () => {
      const res = await classesApi.getClassAttendance(classId);
      return res.data;
    }
  });

  // When attendanceData loads or selectedSession changes, prepopulate records
  const enrolledStudents = attendanceData?.enrolledStudents || [];
  const existingSessions = attendanceData?.sessions || [];
  const currentSessionData = existingSessions.find((s: any) => s.sessionNumber === selectedSession);

  // Sync state when session changes
  const handleSessionChange = (sessionNum: number) => {
    setSelectedSession(sessionNum);
    setSessionTitle(`جلسه ${sessionNum}`);
    const existing = existingSessions.find((s: any) => s.sessionNumber === sessionNum);
    const newRecords: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; note: string }> = {};

    enrolledStudents.forEach((student: any) => {
      const studentId = student.user?._id;
      if (!studentId) return;
      const rec = existing?.records?.find((r: any) => (r.userId?._id || r.userId)?.toString() === studentId.toString());
      newRecords[studentId] = {
        status: rec ? rec.status : 'present',
        note: rec?.note || ''
      };
    });

    setRecords(newRecords);
  };

  // Pre-fill on initial load if empty
  if (enrolledStudents.length > 0 && Object.keys(records).length === 0) {
    const existing = currentSessionData;
    const initialRecords: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; note: string }> = {};
    enrolledStudents.forEach((student: any) => {
      const studentId = student.user?._id;
      if (!studentId) return;
      const rec = existing?.records?.find((r: any) => (r.userId?._id || r.userId)?.toString() === studentId.toString());
      initialRecords[studentId] = {
        status: rec ? rec.status : 'present',
        note: rec?.note || ''
      };
    });
    setRecords(initialRecords);
  }

  // Mutation to save attendance
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payloadRecords = Object.entries(records).map(([userId, data]) => ({
        userId,
        status: data.status,
        note: data.note
      }));

      return classesApi.takeSessionAttendance(classId, {
        sessionNumber: selectedSession,
        sessionTitle,
        sessionDate: new Date().toISOString(),
        records: payloadRecords
      });
    },
    onSuccess: () => {
      toast.success(`حضور و غیاب جلسه ${selectedSession} با موفقیت ثبت شد`);
      queryClient.invalidateQueries({ queryKey: ['classAttendance', classId] });
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت حضور و غیاب');
    }
  });

  const setAllStatus = (status: 'present' | 'absent') => {
    const updated: Record<string, any> = {};
    Object.keys(records).forEach((id) => {
      updated[id] = { ...records[id], status };
    });
    setRecords(updated);
    toast.success(status === 'present' ? 'همه حاضر علامت‌گذاری شدند' : 'همه غایب علامت‌گذاری شدند');
  };

  const updateStudentStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { note: '' }),
        status
      }
    }));
  };

  const updateStudentNote = (studentId: string, note: string) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'present' }),
        note
      }
    }));
  };

  // Stats for current session
  const totalInSession = Object.keys(records).length;
  const presentCount = Object.values(records).filter(r => r.status === 'present').length;
  const lateCount = Object.values(records).filter(r => r.status === 'late').length;
  const absentCount = Object.values(records).filter(r => r.status === 'absent').length;
  const excusedCount = Object.values(records).filter(r => r.status === 'excused').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {isAdmin ? 'پنل مدیریت آکادمی' : 'پنل استاد'}
                </span>
                <span className="text-xs text-slate-500">حضور و غیاب دانشجوها</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 line-clamp-1 mt-0.5">
                {classItem.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 pt-4 bg-white border-b border-slate-200 flex gap-4 text-sm font-bold">
          <button
            onClick={() => setActiveTab('take')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'take'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            ثبت حضور و غیاب جلسه
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'report'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            گزارش کل جلسات و وضعیت مالی
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span>درحال بارگذاری لیست دانشجویان و سوابق کلاس...</span>
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">هیچ دانشجویی هنوز در این کلاس ثبت‌نام نکرده است</h3>
              <p className="text-xs text-slate-500 mt-1">به محض ثبت‌نام اولین دانشجو، فهرست حضور و غیاب در این بخش فعال خواهد شد.</p>
            </div>
          ) : activeTab === 'take' ? (
            <>
              {/* Session Selector & Quick Actions */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700 shrink-0">شماره جلسه:</label>
                    <select
                      value={selectedSession}
                      onChange={(e) => handleSessionChange(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[...Array(Math.max(totalSessions, existingSessions.length || 1))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          جلسه {i + 1} {existingSessions.some((s: any) => s.sessionNumber === i + 1) ? '✓ (ثبت شده)' : ''}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="عنوان موضوع جلسه..."
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 min-w-[140px]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllStatus('present')}
                      className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      همه حاضر
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllStatus('absent')}
                      className="text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      همه غایب
                    </button>
                  </div>
                </div>

                {/* Session Attendance KPI bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">حاضر</span>
                    <span className="font-bold text-emerald-600 text-sm">{presentCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">تأخیر</span>
                    <span className="font-bold text-amber-600 text-sm">{lateCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">غایب</span>
                    <span className="font-bold text-rose-600 text-sm">{absentCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">موجه</span>
                    <span className="font-bold text-blue-600 text-sm">{excusedCount}</span>
                  </div>
                </div>
              </div>

              {/* Student Attendance List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                <div className="bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-600 grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5">نام و مشخصات دانشجو</span>
                  <span className="col-span-4 text-center">وضعیت حضور</span>
                  <span className="col-span-3 text-center">یادداشت استاد</span>
                </div>

                {enrolledStudents.map((enroll: any) => {
                  const student = enroll.user;
                  if (!student) return null;
                  const studentId = student._id;
                  const currentRec = records[studentId] || { status: 'present', note: '' };
                  const isPreRegistered = enroll.paymentType === 'deposit' && !enroll.remainingPaid;

                  return (
                    <div key={studentId} className="p-3 sm:px-4 sm:py-3.5 bg-white hover:bg-slate-50/80 transition grid grid-cols-12 gap-2 items-center">
                      {/* Student info */}
                      <div className="col-span-5 flex items-center gap-2.5">
                        <img
                          src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName + ' ' + student.lastName)}&background=random`}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                            <span>{student.email || student.mobile || 'بدون ایمیل'}</span>
                            {isPreRegistered && (
                              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded font-bold">
                                پیش‌ثبت‌نام (بدهکار)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status toggle buttons */}
                      <div className="col-span-4 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(studentId, 'present')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentRec.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title="حاضر"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">حاضر</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentStatus(studentId, 'late')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentRec.status === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                          title="با تأخیر"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تأخیر</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentStatus(studentId, 'absent')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentRec.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                          title="غایب"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">غایب</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateStudentStatus(studentId, 'excused')}
                          className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            currentRec.status === 'excused'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                          title="مرخصی موجه"
                        >
                          <span className="hidden sm:inline">موجه</span>
                        </button>
                      </div>

                      {/* Note */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={currentRec.note || ''}
                          onChange={(e) => updateStudentNote(studentId, e.target.value)}
                          placeholder="توضیح کوتاه..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Summary Report across all sessions */
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl text-xs text-blue-800 leading-relaxed">
                در این بخش آمار کلی حضور و غیاب تک تک دانشجویان در تمام جلسات ثبت شده محاسبه گردیده است. همچنین دانشجویانی که پیش‌ثبت‌نام انجام داده‌اند با وضعیت تسویه حساب مشخص شده‌اند.
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                <div className="bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-600 grid grid-cols-12 gap-2">
                  <span className="col-span-4">دانشجو</span>
                  <span className="col-span-3 text-center">تعداد جلسات حضور</span>
                  <span className="col-span-2 text-center">درصد حضور</span>
                  <span className="col-span-3 text-center">وضعیت شهریه</span>
                </div>

                {enrolledStudents.map((enroll: any) => {
                  const student = enroll.user;
                  if (!student) return null;
                  const studentId = student._id;
                  
                  // Calculate from existing sessions
                  let present = 0;
                  const totalRecorded = existingSessions.length;
                  existingSessions.forEach((sess: any) => {
                    const r = sess.records?.find((rec: any) => (rec.userId?._id || rec.userId)?.toString() === studentId.toString());
                    if (r && (r.status === 'present' || r.status === 'late')) present++;
                  });

                  const pct = totalRecorded > 0 ? Math.round((present / totalRecorded) * 100) : 100;
                  const isPre = enroll.paymentType === 'deposit';

                  return (
                    <div key={studentId} className="px-4 py-3 bg-white hover:bg-slate-50/80 transition grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-4 flex items-center gap-2">
                        <img
                          src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName + ' ' + student.lastName)}`}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <span className="font-bold text-slate-900 truncate">{student.firstName} {student.lastName}</span>
                      </div>

                      <div className="col-span-3 text-center font-bold text-slate-700">
                        {present} از {totalRecorded} جلسه ثبت شده
                      </div>

                      <div className="col-span-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                          pct >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          pct >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pct}٪
                        </span>
                      </div>

                      <div className="col-span-3 text-center">
                        {isPre ? (
                          enroll.remainingPaid ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              تسویه کامل شده
                            </span>
                          ) : (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              بدهکار: {enroll.remainingBalance?.toLocaleString('fa-IR')} تومان
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 font-medium">نقدی کامل</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {activeTab === 'take' && (
              <span>پس از انتخاب وضعیت دانشجویان، روی دکمه ذخیره کلیک فرمایید.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-sm rounded-xl transition"
            >
              بستن
            </button>

            {activeTab === 'take' && enrolledStudents.length > 0 && (
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                ذخیره حضور و غیاب جلسه {selectedSession}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
