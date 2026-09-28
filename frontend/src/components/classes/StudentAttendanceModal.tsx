'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  X, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Loader2, Calendar, Award, CreditCard, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StudentAttendanceModalProps {
  classItem: any;
  onClose: () => void;
}

export function StudentAttendanceModal({ classItem, onClose }: StudentAttendanceModalProps) {
  const queryClient = useQueryClient();
  const classId = classItem._id;

  const { data: attendanceData, isLoading, refetch } = useQuery({
    queryKey: ['studentAttendance', classId],
    queryFn: async () => {
      const res = await classesApi.getClassAttendance(classId);
      return res.data;
    }
  });

  // Pay remaining balance mutation
  const payRemainingMutation = useMutation({
    mutationFn: () => classesApi.payRemainingBalance(classId),
    onSuccess: () => {
      toast.success('مابقی شهریه با موفقیت تسویه شد!');
      queryClient.invalidateQueries({ queryKey: ['myClasses'] });
      queryClient.invalidateQueries({ queryKey: ['studentAttendance', classId] });
      refetch();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'خطا در تسویه مانده شهریه';
      toast.error(msg, { duration: 4000 });
      if (err.response?.data?.code === 'INSUFFICIENT_BALANCE' || msg.includes('کیف پول')) {
        toast('در حال هدایت به بخش کیف پول جهت افزایش موجودی...', { icon: '💳' });
        setTimeout(() => {
          window.location.href = '/student/wallet';
        }, 2000);
      }
    }
  });

  const isDeposit = classItem.paymentType === 'deposit' || classItem.depositAmount > 0;
  const hasRemainingBalance = classItem.remainingBalance > 0 && !classItem.remainingPaid;

  const totalSessions = attendanceData?.totalSessions || classItem.sessions || 10;
  const heldSessions = attendanceData?.heldSessions || 0;
  const presentCount = attendanceData?.presentCount || 0;
  const lateCount = attendanceData?.lateCount || 0;
  const absentCount = attendanceData?.absentCount || 0;
  const excusedCount = attendanceData?.excusedCount || 0;
  const attendancePercentage = attendanceData?.attendancePercentage ?? 100;
  const sessionsLog = attendanceData?.sessionsLog || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                وضعیت حضور و غیاب دانشجو
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 mt-1">
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span>درحال بارگذاری کارنامه حضور و غیاب شما...</span>
            </div>
          ) : (
            <>
              {/* Deposit Reminder Notification Banner if applicable */}
              {hasRemainingBalance && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        یادآوری تسویه مابقی شهریه (پیش‌ثبت‌نام)
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        مانده بدهی شما مبلغ <strong className="font-mono">{classItem.remainingBalance?.toLocaleString('fa-IR')} تومان</strong> است که طبق ضوابط کلاس باید تسویه شود.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => payRemainingMutation.mutate()}
                    disabled={payRemainingMutation.isPending}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60"
                  >
                    {payRemainingMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                    تسویه از کیف پول
                  </button>
                </div>
              )}

              {/* KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 block">جلسات برگزار شده</span>
                  <span className="text-lg font-black text-slate-900">{heldSessions} از {totalSessions}</span>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-700 block">جلسات حاضر</span>
                  <span className="text-lg font-black text-emerald-700">{presentCount + lateCount}</span>
                </div>

                <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200 text-center">
                  <span className="text-xs text-rose-700 block">جلسات غایب</span>
                  <span className="text-lg font-black text-rose-700">{absentCount}</span>
                </div>

                <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200 text-center">
                  <span className="text-xs text-blue-700 block">درصد مشارکت</span>
                  <span className="text-lg font-black text-blue-700">{attendancePercentage}٪</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>نرخ حضور شما در جلسات</span>
                  <span>{attendancePercentage}٪</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      attendancePercentage >= 80 ? 'bg-emerald-500' :
                      attendancePercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${attendancePercentage}%` }}
                  />
                </div>
              </div>

              {/* Sessions Breakdown List */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  ریز جلسات و گزارش ثبت شده توسط استاد
                </h3>

                {heldSessions === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                    هنوز هیچ جلسه‌ای از این کلاس توسط استاد ثبت حضور و غیاب نشده است.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    {sessionsLog.map((sess: any) => {
                      const isPresent = sess.status === 'present';
                      const isLate = sess.status === 'late';
                      const isExcused = sess.status === 'excused';
                      const isAbsent = sess.status === 'absent';

                      return (
                        <div key={sess.sessionNumber} className="p-3.5 bg-white hover:bg-slate-50/80 transition flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPresent ? 'bg-emerald-100 text-emerald-700' :
                              isLate ? 'bg-amber-100 text-amber-700' :
                              isExcused ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {sess.sessionNumber}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-900">
                                {sess.sessionTitle || `جلسه شماره ${sess.sessionNumber}`}
                              </div>
                              {sess.note && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  یادداشت: {sess.note}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isPresent && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                حاضر
                              </span>
                            )}
                            {isLate && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                                <Clock className="w-3.5 h-3.5" />
                                با تأخیر
                              </span>
                            )}
                            {isExcused && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl">
                                موجه
                              </span>
                            )}
                            {isAbsent && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                                <XCircle className="w-3.5 h-3.5" />
                                غایب
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
}
