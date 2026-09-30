'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi, ISessionSyllabus } from '@/features/learning/api/classes.api';
import { 
  X, Video, Calendar, Clock, Link as LinkIcon, ExternalLink, 
  CheckCircle2, Plus, Trash2, Save, Loader2, Copy, Check, 
  PlayCircle, AlertCircle, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClassSessionsModalProps {
  classItem: any;
  onClose: () => void;
}

export function ClassSessionsModal({ classItem, onClose }: ClassSessionsModalProps) {
  const queryClient = useQueryClient();
  const classId = classItem._id;

  const initialSyllabus: ISessionSyllabus[] = (classItem.syllabus && classItem.syllabus.length > 0)
    ? classItem.syllabus.map((s: any, idx: number) => ({
        sessionNumber: s.sessionNumber || idx + 1,
        title: s.title || `جلسه ${idx + 1}`,
        description: s.description || '',
        date: s.date || '',
        time: s.time || classItem.scheduleTime || '',
        durationMinutes: s.durationMinutes || classItem.sessionDuration || 90,
        meetingLink: s.meetingLink || (idx === 0 ? classItem.meetingLink : '') || '',
        recordingUrl: s.recordingUrl || '',
        isHeld: !!s.isHeld
      }))
    : Array.from({ length: classItem.sessions || 5 }).map((_, idx) => ({
        sessionNumber: idx + 1,
        title: `جلسه ${idx + 1}`,
        description: '',
        date: '',
        time: classItem.scheduleTime || '',
        durationMinutes: classItem.sessionDuration || 90,
        meetingLink: (idx === 0 ? classItem.meetingLink : '') || '',
        recordingUrl: '',
        isHeld: false
      }));

  const [sessions, setSessions] = useState<ISessionSyllabus[]>(initialSyllabus);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (updatedSyllabus: ISessionSyllabus[]) => {
      return classesApi.updateClass(classId, {
        syllabus: updatedSyllabus,
        sessions: updatedSyllabus.length,
        // Also update primary meeting link if session 1 has it
        meetingLink: updatedSyllabus[0]?.meetingLink || classItem.meetingLink || ''
      });
    },
    onSuccess: () => {
      toast.success('اطلاعات و لینک‌های جلسات کلاس با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      queryClient.invalidateQueries({ queryKey: ['classAttendance', classId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره جلسات کلاس');
    }
  });

  const handleUpdate = (index: number, key: keyof ISessionSyllabus, val: any) => {
    setSessions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleAddSession = () => {
    const nextNum = sessions.length + 1;
    setSessions(prev => [
      ...prev,
      {
        sessionNumber: nextNum,
        title: `جلسه ${nextNum}`,
        description: '',
        date: '',
        time: classItem.scheduleTime || '',
        durationMinutes: classItem.sessionDuration || 90,
        meetingLink: '',
        recordingUrl: '',
        isHeld: false
      }
    ]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((s, idx) => ({ ...s, sessionNumber: idx + 1 }));
    });
  };

  const handleCopyLink = (link: string, idx: number) => {
    if (!link) {
      toast.error('هنوز لینکی برای این جلسه ثبت نشده است');
      return;
    }
    navigator.clipboard.writeText(link);
    setCopiedIdx(idx);
    toast.success('لینک جلسه کپی شد');
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">{classItem.title}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {classItem.mode === 'online' ? 'کلاس آنلاین' : 'حضوری'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                مدیریت لینک‌های ورود مستقیم (اسکای‌روم / گوگل میت)، بازپخش ویدیو و وضعیت برگزاری جلسات
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

        {/* Modal Sub-bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 text-slate-600">
            <span>مجموع جلسات: <strong className="text-slate-900">{sessions.length} جلسه</strong></span>
            <span>برگزار شده: <strong className="text-emerald-700">{sessions.filter(s => s.isHeld).length}</strong></span>
            <span>باقیمانده: <strong className="text-blue-700">{sessions.filter(s => !s.isHeld).length}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleAddSession}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            افزودن جلسه جدید
          </button>
        </div>

        {/* Sessions List Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">هنوز جلسه‌ای برای این کلاس تعریف نشده است</p>
              <button 
                onClick={handleAddSession}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> ایجاد اولین جلسه
              </button>
            </div>
          ) : (
            sessions.map((sess, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border transition-all ${
                  sess.isHeld 
                    ? 'bg-slate-50/70 border-slate-200' 
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      sess.isHeld ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sess.sessionNumber}
                    </span>
                    <input 
                      type="text"
                      value={sess.title}
                      onChange={e => handleUpdate(idx, 'title', e.target.value)}
                      placeholder={`عنوان جلسه ${sess.sessionNumber}`}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white px-2 py-1 rounded outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Held toggle button */}
                    <button
                      type="button"
                      onClick={() => handleUpdate(idx, 'isHeld', !sess.isHeld)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        sess.isHeld 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {sess.isHeld ? 'برگزار شده' : 'پیش‌رو'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSession(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="حذف این جلسه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details & Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  
                  {/* Meeting Link input & actions */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-blue-700">
                        <LinkIcon className="w-3.5 h-3.5" />
                        لینک ورود آنلاین (Skyroom / Google Meet / ...)
                      </span>
                      {sess.meetingLink && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(sess.meetingLink || '', idx)}
                            className="text-slate-500 hover:text-blue-600 flex items-center gap-0.5 text-[10px]"
                          >
                            {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedIdx === idx ? 'کپی شد' : 'کپی لینک'}
                          </button>
                          <a
                            href={sess.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5 text-[10px]"
                          >
                            تست ورود <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </label>
                    <input 
                      type="text"
                      value={sess.meetingLink || ''}
                      onChange={e => handleUpdate(idx, 'meetingLink', e.target.value)}
                      placeholder="https://www.skyroom.online/ch/... یا meet.google.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-blue-800 font-mono dir-ltr placeholder:dir-rtl placeholder:font-sans focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Recording Link */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-purple-700">
                        <PlayCircle className="w-3.5 h-3.5" />
                        لینک ضبط / بازپخش ویدیو جلسه (Recording)
                      </span>
                      {sess.recordingUrl && (
                        <a
                          href={sess.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline flex items-center gap-0.5 text-[10px]"
                        >
                          مشاهده بازپخش <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </label>
                    <input 
                      type="text"
                      value={sess.recordingUrl || ''}
                      onChange={e => handleUpdate(idx, 'recordingUrl', e.target.value)}
                      placeholder="لینک دانلود یا استریم ویدیو (اختیاری)..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-purple-800 font-mono dir-ltr placeholder:dir-rtl placeholder:font-sans focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Date & Time optional notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">تاریخ و ساعت جلسه</label>
                    <input 
                      type="text"
                      value={sess.time || ''}
                      onChange={e => handleUpdate(idx, 'time', e.target.value)}
                      placeholder="مثال: چهارشنبه ۱۴ مهر - ساعت ۱۸:۰۰"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Description / Summary */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">موضوعات و تمرین‌های جلسه</label>
                    <input 
                      type="text"
                      value={sess.description || ''}
                      onChange={e => handleUpdate(idx, 'description', e.target.value)}
                      placeholder="سرفصل‌ها و توضیحات کوتاه جلسه..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-right">
            دانشجویان ثبت‌نام شده لینک ورود هر جلسه را در پنل کاربری خود مشاهده خواهند کرد.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              انصراف
            </button>

            <button
              type="button"
              onClick={() => saveMutation.mutate(sessions)}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs disabled:opacity-60"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ذخیره تغییرات جلسات
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
