'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  X, Plus, Trash2, Calendar, Clock, MapPin, Video, 
  CreditCard, BookOpen, Target, ShieldCheck, Loader2, 
  Save, Image as ImageIcon, CheckCircle2, AlertCircle, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaUploader } from '@/components/common/MediaUploader';

// Helper to robustly parse numeric inputs supporting Persian and Arabic numerals on mobile keyboards
const parseNumericInput = (val: string | number): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const enDigits = val
    .toString()
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[^0-9]/g, '');
  return enDigits ? parseInt(enDigits, 10) : 0;
};

export const DAYS_OF_WEEK = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

interface ClassFormModalProps {
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any> | void;
  isSubmitting: boolean;
  title: string;
  isAdmin?: boolean;
}

export function ClassFormModal({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  isAdmin = false
}: ClassFormModalProps) {
  if (!isOpen) return null;

  const { data: usersData } = useQuery({
    queryKey: ['admin-instructors-list'],
    queryFn: () => api.get('/admin/users').then(res => res.data),
    enabled: isAdmin
  });

  const rawUsers = usersData?.users || (Array.isArray(usersData) ? usersData : []);
  const instructorsList = rawUsers.filter((u: any) => {
    const roleSlug = u.role?.slug || u.role;
    return roleSlug === 'instructor' || roleSlug === 'teacher' || roleSlug === 'admin' || roleSlug === 'super_admin';
  });

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    type: initialData?.type || 'public',
    mode: initialData?.mode || 'online',
    instructorId: initialData?.instructors?.[0]?._id || (typeof initialData?.instructors?.[0] === 'string' ? initialData.instructors[0] : '') || '',
    startDate: initialData?.startDate ? initialData.startDate.substring(0, 16) : '',
    endDate: initialData?.endDate ? initialData.endDate.substring(0, 16) : '',
    price: initialData?.price || 0,
    discountPrice: initialData?.discountPrice || 0,
    capacity: initialData?.capacity || initialData?.maxStudents || 30,
    sessions: initialData?.sessions || 10,
    totalHours: initialData?.totalHours || 20,
    sessionDuration: initialData?.sessionDuration || 90,
    thumbnail: initialData?.thumbnail || '',
    status: initialData?.status || 'published',

    // Calendar
    scheduleDays: (initialData?.scheduleDays?.length ? initialData.scheduleDays : ['شنبه', 'چهارشنبه']) as string[],
    scheduleTime: initialData?.scheduleTime || '۱۸:۰۰ الی ۲۰:۰۰',

    // Physical venue
    city: initialData?.city || 'تهران',
    address: initialData?.address || '',
    venueDetails: initialData?.venueDetails || '',

    // Online
    meetingPlatform: initialData?.meetingPlatform || 'اسکای‌روم (Skyroom)',
    meetingLink: initialData?.meetingLink || '',

    // Pre-registration
    allowPreRegistration: !!initialData?.allowPreRegistration,
    preRegistrationDeposit: initialData?.preRegistrationDeposit || 0,
    remainingPaymentDueAfterSession: initialData?.remainingPaymentDueAfterSession || 2,

    // Target Audience & Prerequisites
    targetAudience: (initialData?.targetAudience?.length ? initialData.targetAudience : [
      'علاقه‌مندان به یادگیری تعاملی و عملی',
      'افرادی که به دنبال ورود سریع به بازار کار هستند',
      'دانشجویان و فارغ‌التحصیلان رشته‌های مرتبط'
    ]) as string[],

    prerequisites: (initialData?.prerequisites?.length ? initialData.prerequisites : [
      'آشنایی اولیه با مفاهیم پایه',
      'همراه داشتن لپ‌تاپ برای تمرین‌های کلاسی',
      'تعهد به حضور منظم در جلسات طبق تقویم'
    ]) as string[],

    // Syllabus
    syllabus: (initialData?.syllabus?.length ? initialData.syllabus : [
      { sessionNumber: 1, title: 'جلسه ۱: معارفه و مفاهیم بنیادین', description: 'تشریح سرفصل‌ها، ابزارها و مقدمات راه‌اندازی محیط کار', durationMinutes: 90 },
      { sessionNumber: 2, title: 'جلسه ۲: معماری و شروع پیاده‌سازی عملی', description: 'کدنویسی و حل گام‌به‌گام اولین بخش پروژه', durationMinutes: 90 },
      { sessionNumber: 3, title: 'جلسه ۳: تکنیک‌های پیشرفته و کارگاهی', description: 'پیاده‌سازی ماژول‌های اصلی و تعامل مستقیم با استاد', durationMinutes: 90 },
    ]) as { sessionNumber: number; title: string; description: string; durationMinutes: number }[]
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'pricing' | 'content' | 'syllabus'>('basic');

  // New item inputs
  const [newAudienceInput, setNewAudienceInput] = useState('');
  const [newPrereqInput, setNewPrereqInput] = useState('');

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const addAudienceItem = () => {
    if (!newAudienceInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      targetAudience: [...prev.targetAudience, newAudienceInput.trim()]
    }));
    setNewAudienceInput('');
  };

  const removeAudienceItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.filter((_, i) => i !== index)
    }));
  };

  const addPrereqItem = () => {
    if (!newPrereqInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, newPrereqInput.trim()]
    }));
    setNewPrereqInput('');
  };

  const removePrereqItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addSyllabusSession = () => {
    const nextNum = formData.syllabus.length + 1;
    setFormData(prev => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        { sessionNumber: nextNum, title: `جلسه ${nextNum}`, description: '', durationMinutes: 90 }
      ],
      sessions: Math.max(prev.sessions, nextNum)
    }));
  };

  const removeSyllabusSession = (index: number) => {
    setFormData(prev => {
      const nextList = prev.syllabus.filter((_, i) => i !== index).map((s, idx) => ({ ...s, sessionNumber: idx + 1 }));
      return {
        ...prev,
        syllabus: nextList,
        sessions: nextList.length || 1
      };
    });
  };

  const updateSyllabusItem = (index: number, key: string, val: any) => {
    setFormData(prev => {
      const next = [...prev.syllabus];
      next[index] = { ...next[index], [key]: val };
      return { ...prev, syllabus: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error('عنوان و شناسه (Slug) کلاس الزامی است');
      setActiveTab('basic');
      return;
    }

    const payload = {
      ...formData,
      instructors: formData.instructorId ? [formData.instructorId] : (initialData?.instructors || undefined),
      price: Number(formData.price) || 0,
      discountPrice: Number(formData.discountPrice) || 0,
      capacity: Number(formData.capacity) || 30,
      sessions: Number(formData.sessions) || formData.syllabus.length || 10,
      totalHours: Number(formData.totalHours) || 20,
      sessionDuration: Number(formData.sessionDuration) || 90,
      preRegistrationDeposit: formData.allowPreRegistration ? Number(formData.preRegistrationDeposit) : 0,
      remainingPaymentDueAfterSession: Number(formData.remainingPaymentDueAfterSession) || 2,
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {isAdmin ? 'مدیریت کل سیستم' : 'پنل استاد'}
                </span>
                <span className="text-xs text-slate-500">پیکربندی کامل کلاس</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 mt-0.5">
                {title}
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex gap-2 sm:gap-4 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`pb-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>۱. مشخصات و شیوه</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>۲. تقویم و زمان‌بندی</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>۳. شهریه و بیعانه</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`pb-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'content'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>۴. توضیحات و پیش‌نیاز</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`pb-3 border-b-2 transition shrink-0 flex items-center gap-1.5 ${
              activeTab === 'syllabus'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>۵. سرفصل‌ها و جلسات ({formData.syllabus.length})</span>
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: BASIC & MODE */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان کامل کلاس *</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => {
                      const t = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        title: t,
                        slug: prev.slug ? prev.slug : t.toLowerCase().trim().replace(/[\s\W-]+/g, '-')
                      }));
                    }}
                    placeholder="مثال: دوره تخصصی ساخت ربات‌های معاملاتی با Python"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه یکتای آدرس (Slug) *</label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="python-trading-bots"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">خلاصه کوتاه معرفی (۱ یا ۲ جمله)</label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                    rows={2}
                    placeholder="خلاصه هدف اصلی این کارگاه یا کلاس..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شیوه برگزاری *</label>
                  <select
                    value={formData.mode}
                    onChange={e => setFormData({ ...formData, mode: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                  >
                    <option value="online">🌐 آنلاین (وبینار تعاملی زنده در اسکای‌روم)</option>
                    <option value="in_person">🏢 حضوری (کارگاه عملی در سالن / کلاس فیزیکی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع کلاس</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                  >
                    <option value="public">عمومی</option>
                    <option value="private">خصوصی (VIP)</option>
                  </select>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      استاد / مدرس مسئول کلاس
                    </label>
                    <select
                      value={formData.instructorId}
                      onChange={e => setFormData({ ...formData, instructorId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                    >
                      <option value="">-- انتخاب استاد از لیست (پیش‌فرض: سازنده) --</option>
                      {instructorsList.map((inst: any) => (
                        <option key={inst._id} value={inst._id}>
                          {inst.firstName || ''} {inst.lastName || ''} ({inst.phone || inst.email || 'مدرس'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">وضعیت انتشار</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                    >
                      <option value="published">منتشر شده (فعال و آماده ثبت‌نام)</option>
                      <option value="draft">پیش‌نویس</option>
                      <option value="completed">پایان‌یافته</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <MediaUploader
                    label="تصویر پوستر کلاس (آپلود فایل یا درج نشانی اینترنتی)"
                    value={formData.thumbnail}
                    onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                    accept="image/*"
                    previewType="image"
                  />
                </div>
              </div>

              {/* Mode Details Section */}
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  {formData.mode === 'online' ? <Video className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 text-emerald-600" />}
                  {formData.mode === 'online' ? 'مشخصات اتاق جلسه و وبینار آنلاین' : 'مشخصات محل فیزیکی و سالن کلاس حضوری'}
                </h4>

                {formData.mode === 'online' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">پلتفرم وبینار</label>
                      <input
                        type="text"
                        value={formData.meetingPlatform}
                        onChange={e => setFormData({ ...formData, meetingPlatform: e.target.value })}
                        placeholder="اسکای‌روم (Skyroom) / گوگل میت"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">لینک ورود به کلاس آنلاین</label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                        placeholder="https://www.skyroom.online/ch/tecyad/room-1"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر محل برگزاری</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="تهران / اصفهان..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">آدرس دقیق محل کلاس</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="تهران، خیابان آزادی، دانشگاه صنعتی شریف، سالن همایش رازی"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">مشخصات سالن و کلاس (طبقه، اتاق و راهنما)</label>
                      <input
                        type="text"
                        value={formData.venueDetails}
                        onChange={e => setFormData({ ...formData, venueDetails: e.target.value })}
                        placeholder="طبقه ۳، اتاق ۱۰۴، حتماً کارت شناسایی و لپ‌تاپ همراه داشته باشید"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & CALENDAR */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاریخ و ساعت شروع کلاس</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاریخ پایان کلاس (اختیاری)</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">ساعت برگزاری هر جلسه</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={e => setFormData({ ...formData, scheduleTime: e.target.value })}
                    placeholder="مثال: ۱۸:۰۰ الی ۲۰:۰۰"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">مدت هر جلسه (دقیقه)</label>
                  <input
                    type="number"
                    value={formData.sessionDuration}
                    onChange={e => setFormData({ ...formData, sessionDuration: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تعداد جلسات رسمی</label>
                  <input
                    type="number"
                    value={formData.sessions}
                    onChange={e => setFormData({ ...formData, sessions: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">مجموع ساعات آموزش</label>
                  <input
                    type="number"
                    value={formData.totalHours}
                    onChange={e => setFormData({ ...formData, totalHours: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">حداکثر ظرفیت پذیرش (نفر)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-700">روزهای برگزاری کلاس در هفته:</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.scheduleDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & PRE-REGISTRATION */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شهریه کل کلاس (تومان) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.price ? Number(formData.price).toLocaleString('fa-IR') : ''}
                    onChange={e => setFormData({ ...formData, price: parseNumericInput(e.target.value) })}
                    placeholder="0 برای کلاس رایگان"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {formData.price > 0 ? `${Number(formData.price).toLocaleString('fa-IR')} تومان` : 'رایگان'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">شهریه با تخفیف (اختیاری)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.discountPrice ? Number(formData.discountPrice).toLocaleString('fa-IR') : ''}
                    onChange={e => setFormData({ ...formData, discountPrice: parseNumericInput(e.target.value) })}
                    placeholder="در صورت وجود تخفیف"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono"
                  />
                </div>
              </div>

              {/* Pre-registration deposit block */}
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowPreRegModal"
                    checked={formData.allowPreRegistration}
                    onChange={e => setFormData({ ...formData, allowPreRegistration: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <label htmlFor="allowPreRegModal" className="text-sm font-bold text-amber-950 cursor-pointer">
                    فعال‌سازی امکان پیش‌ثبت‌نام با پرداخت بیعانه (پیش‌پرداخت اقساطی)
                  </label>
                </div>

                <p className="text-xs text-amber-800 leading-relaxed">
                  با فعال‌سازی این گزینه، دانشجو می‌تواند تنها با پرداخت مبلغ بیعانه در کلاس جا رزرو کند و مابقی شهریه پس از تشکیل تعداد جلسات مشخص شده تسویه شود.
                </p>

                {formData.allowPreRegistration && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-amber-200/80">
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1.5">
                        مبلغ بیعانه / پیش‌پرداخت (تومان) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.preRegistrationDeposit ? Number(formData.preRegistrationDeposit).toLocaleString('fa-IR') : ''}
                        onChange={e => setFormData({ ...formData, preRegistrationDeposit: parseNumericInput(e.target.value) })}
                        placeholder="مثال: ۵۰۰,۰۰۰"
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:ring-2 focus:ring-amber-500 outline-none dir-ltr text-left font-mono"
                      />
                      <span className="text-[11px] text-amber-800 mt-1 block">
                        مانده بدهی دانشجو: {(Math.max(0, formData.price - formData.preRegistrationDeposit)).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1.5">
                        موعد پرداخت مابقی شهریه (بعد از برگزاری کدام جلسه؟) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-900 font-medium">پس از جلسه شماره</span>
                        <input
                          type="number"
                          min={1}
                          max={formData.sessions}
                          value={formData.remainingPaymentDueAfterSession}
                          onChange={e => setFormData({ ...formData, remainingPaymentDueAfterSession: Number(e.target.value) })}
                          className="w-16 px-2 py-2 rounded-xl border border-amber-300 bg-white text-center font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <span className="text-xs text-amber-900 font-medium">نوتیفیکیشن تسویه ارسال شود</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONTENT, AUDIENCE & PREREQUISITES */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیحات و معرفی کامل کلاس *</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات کامل درباره اهداف کلاس، روند برگزاری، سرفصل‌ها و مهارت‌هایی که دانشجو فرا خواهد گرفت..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                />
              </div>

              {/* Target Audience */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  این کلاس مناسب چه کسانی است؟ (مخاطبان هدف)
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAudienceInput}
                    onChange={e => setNewAudienceInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAudienceItem(); } }}
                    placeholder="مورد جدید را بنویسید و دکمه افزودن را بزنید..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addAudienceItem}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    افزودن
                  </button>
                </div>

                <div className="space-y-1.5">
                  {formData.targetAudience.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAudienceItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  پیش‌نیازها و لوازم مورد نیاز شرکت در کلاس
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPrereqInput}
                    onChange={e => setNewPrereqInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPrereqItem(); } }}
                    placeholder="پیش‌نیاز جدید را بنویسید..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addPrereqItem}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    افزودن
                  </button>
                </div>

                <div className="space-y-1.5">
                  {formData.prerequisites.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200 text-xs">
                      <span className="flex items-center gap-2 text-slate-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePrereqItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYLLABUS & SESSIONS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    مدیریت سرفصل‌ها و جلسات کلاسی
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    عناوین و مباحث جلسات در صفحه عمومی کلاس و فرم حضور و غیاب نمایش داده خواهند شد.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSyllabusSession}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  افزودن جلسه جدید
                </button>
              </div>

              <div className="space-y-3">
                {formData.syllabus.map((sess, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={sess.title}
                            onChange={e => updateSyllabusItem(idx, 'title', e.target.value)}
                            placeholder={`عنوان جلسه ${idx + 1}...`}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={sess.description || ''}
                            onChange={e => updateSyllabusItem(idx, 'description', e.target.value)}
                            placeholder="مباحث و تمرین‌های جلسه..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            value={sess.durationMinutes || 90}
                            onChange={e => updateSyllabusItem(idx, 'durationMinutes', Number(e.target.value))}
                            placeholder="دقیقه"
                            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSyllabusSession(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition shrink-0"
                        title="حذف جلسه"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Online Meeting Link and Recording URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 pr-12">
                      <div>
                        <input
                          type="text"
                          value={(sess as any).meetingLink || ''}
                          onChange={e => updateSyllabusItem(idx, 'meetingLink', e.target.value)}
                          placeholder="لینک ورود مستقیم به این جلسه (اسکای‌روم / گوگل‌میت)..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-blue-700 font-mono dir-ltr placeholder:font-sans placeholder:dir-rtl focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={(sess as any).recordingUrl || ''}
                          onChange={e => updateSyllabusItem(idx, 'recordingUrl', e.target.value)}
                          placeholder="لینک ضبط ویدیوی بازپخش جلسه (اختیاری)..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-purple-700 font-mono dir-ltr placeholder:font-sans placeholder:dir-rtl focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-5 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 hidden sm:block">
              تمام اطلاعات وارد شده پس از کلیک بر روی دکمه ذخیره در دیتابیس ثبت خواهند شد.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>درحال ذخیره اطلاعات...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ذخیره نهایی کلاس</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
