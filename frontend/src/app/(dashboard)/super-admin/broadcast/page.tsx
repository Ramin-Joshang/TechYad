'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Send, Users, MessageSquare, Bell, CheckCircle2, 
  Loader2, AlertCircle, Info, Smartphone, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BroadcastNotificationPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [sendSms, setSendSms] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [sentResult, setSentResult] = useState<any>(null);

  // Fetch courses list for selective target
  const { data: coursesData } = useQuery({
    queryKey: ['coursesListSimple'],
    queryFn: () => adminApi.getCourses().then((res: any) => res.data)
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.sendBroadcast(data),
    onSuccess: (res: any) => {
      toast.success('پیام سراسری با موفقیت برای کاربران ارسال شد');
      setSentResult(res.data);
      setTitle('');
      setMessage('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ارسال پیام همگانی');
    }
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      toast.error('لطفاً عنوان و متن پیام را کامل بنویسید');
      return;
    }

    broadcastMutation.mutate({
      title: title.trim(),
      message: message.trim(),
      targetRole,
      sendSms,
      courseId: courseId || undefined
    });
  };

  const courses = coursesData?.courses || coursesData || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">ارسال اعلان سراسری و کمپین پیامکی</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">ارسال نوتیفیکیشن درون‌برنامه‌ای و پیامک گروهی به کاربران، اساتید یا دانشجویان یک دوره</p>
          </div>
        </div>
      </div>

      {sentResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-bold">عملیات با موفقیت انجام شد: </span>
            پیام شما با موفقیت برای <b>{sentResult.recipientCount?.toLocaleString('fa-IR')} کاربر</b> ارسال گردید.
            {sentResult.smsSent && <span className="mr-2 text-xs bg-emerald-200 px-2 py-0.5 rounded">همراه با پیامک</span>}
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6">
        
        {/* Audience Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-800">
            ۱. انتخاب گروه هدف و مخاطبان *
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'all', label: 'همه کاربران پلتفرم', icon: Users },
              { id: 'student', label: 'فقط دانشجویان', icon: Bell },
              { id: 'instructor', label: 'فقط مدرسین و اساتید', icon: MessageSquare },
              { id: 'admin', label: 'کارکنان و مدیران', icon: CheckCircle2 },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = targetRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTargetRole(tab.id as any)}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 ${
                    isSelected 
                      ? 'border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className="text-xs font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Course Filter */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            محدودسازی به دانشجویان یک دوره خاص (اختیاری):
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">-- بدون محدودیت دوره (کل مخاطبان گروه بالا) --</option>
            {courses.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-gray-400">
            در صورت انتخاب دوره، اعلان تنها به کاربرانی ارسال می‌شود که این دوره را ثبت‌نام کرده‌اند.
          </p>
        </div>

        {/* Title and Message */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              ۲. عنوان اعلان *
            </label>
            <input
              type="text"
              placeholder="مثلاً: تخفیف ویژه آخر فصل یا بروزرسانی سرفصل‌های آموزشی..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              ۳. متن کامل پیام *
            </label>
            <textarea
              rows={4}
              placeholder="متن پیام اعلان را با جزئیات کامل تایپ کنید..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="border-t pt-4">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            ۴. کانال‌های ارسال
          </label>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
              <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-blue-900">نوتیفیکیشن درون‌برنامه‌ای: </span>
                <span className="text-blue-700">به صورت پیش‌فرض در زنگوله بالای داشبورد کاربر ذخیره و نمایش داده می‌شود.</span>
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-purple-50/60 border border-purple-100 rounded-2xl cursor-pointer hover:bg-purple-100/50 transition-colors">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-purple-900">ارسال پیامک (SMS) به شماره موبایل کاربران: </span>
                <span className="text-purple-700">از طریق وب‌سرویس پیامکی پلتفرم به شماره همراه ثبت‌شده کاربران پیامک می‌شود.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            disabled={broadcastMutation.isPending}
            onClick={handleSend}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50"
          >
            {broadcastMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            ارسال همگانی اعلان
          </button>
        </div>

      </div>

    </div>
  );
}
