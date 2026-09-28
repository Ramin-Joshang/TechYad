'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Loader2, Search, Video, Calendar, Users, Plus, Edit, Trash2, 
  Save, X, Clock, MapPin, CheckCircle2, Award, ClipboardCheck,
  ChevronDown, AlertCircle, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AttendanceModal } from '@/components/classes/AttendanceModal';

const DAYS_OF_WEEK = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

export default function InstructorClassesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    mode: 'online' as 'online' | 'in_person',
    startDate: '',
    endDate: '',
    price: 0,
    discountPrice: 0,
    capacity: 30,
    sessions: 10,
    totalHours: 20,
    // Calendar & Schedule
    scheduleDays: ['شنبه', 'چهارشنبه'] as string[],
    scheduleTime: '۱۷:۰۰ الی ۱۹:۰۰',
    // Physical venue
    city: 'تهران',
    address: '',
    venueDetails: '',
    // Online
    meetingPlatform: 'اسکای‌روم (Skyroom)',
    meetingLink: '',
    // Pre-registration
    allowPreRegistration: false,
    preRegistrationDeposit: 0,
    remainingPaymentDueAfterSession: 2,
    // Syllabus
    syllabus: [
      { sessionNumber: 1, title: 'آشنایی و مفاهیم بنیادین', description: 'معرفی مبانی، پیش‌نیازها و محیط کاری', durationMinutes: 90 },
      { sessionNumber: 2, title: 'پیاده‌سازی بخش اول پروژه', description: 'کدنویسی عملی و کارگاهی', durationMinutes: 90 },
    ]
  });

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['instructor-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/instructor/classes', data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کلاس');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/instructor/classes/${editId}`, data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      resetForm();
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

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      mode: 'online',
      startDate: '',
      endDate: '',
      price: 0,
      discountPrice: 0,
      capacity: 30,
      sessions: 10,
      totalHours: 20,
      scheduleDays: ['شنبه', 'چهارشنبه'],
      scheduleTime: '۱۷:۰۰ الی ۱۹:۰۰',
      city: 'تهران',
      address: '',
      venueDetails: '',
      meetingPlatform: 'اسکای‌روم (Skyroom)',
      meetingLink: '',
      allowPreRegistration: false,
      preRegistrationDeposit: 0,
      remainingPaymentDueAfterSession: 2,
      syllabus: [
        { sessionNumber: 1, title: 'آشنایی و مفاهیم بنیادین', description: 'معرفی مبانی، پیش‌نیازها و محیط کاری', durationMinutes: 90 },
        { sessionNumber: 2, title: 'پیاده‌سازی بخش اول پروژه', description: 'کدنویسی عملی و کارگاهی', durationMinutes: 90 },
      ]
    });
  };

  const handleEdit = (cls: any) => {
    setEditId(cls._id);
    setFormData({
      title: cls.title || '',
      slug: cls.slug || '',
      shortDescription: cls.shortDescription || '',
      description: cls.description || '',
      mode: cls.mode || 'online',
      startDate: cls.startDate ? cls.startDate.substring(0, 16) : '',
      endDate: cls.endDate ? cls.endDate.substring(0, 16) : '',
      price: cls.price || 0,
      discountPrice: cls.discountPrice || 0,
      capacity: cls.capacity || cls.maxStudents || 30,
      sessions: cls.sessions || 10,
      totalHours: cls.totalHours || 20,
      scheduleDays: cls.scheduleDays?.length ? cls.scheduleDays : ['شنبه', 'چهارشنبه'],
      scheduleTime: cls.scheduleTime || '۱۷:۰۰ الی ۱۹:۰۰',
      city: cls.city || 'تهران',
      address: cls.address || '',
      venueDetails: cls.venueDetails || '',
      meetingPlatform: cls.meetingPlatform || 'اسکای‌روم (Skyroom)',
      meetingLink: cls.meetingLink || '',
      allowPreRegistration: !!cls.allowPreRegistration,
      preRegistrationDeposit: cls.preRegistrationDeposit || 0,
      remainingPaymentDueAfterSession: cls.remainingPaymentDueAfterSession || 2,
      syllabus: cls.syllabus?.length ? cls.syllabus : [
        { sessionNumber: 1, title: 'آشنایی و مفاهیم بنیادین', description: 'معرفی مبانی، پیش‌نیازها و محیط کاری', durationMinutes: 90 },
        { sessionNumber: 2, title: 'پیاده‌سازی بخش اول پروژه', description: 'کدنویسی عملی و کارگاهی', durationMinutes: 90 },
      ]
    });
    setShowForm(true);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter(d => d !== day)
        : [...prev.scheduleDays, day]
    }));
  };

  const addSyllabusSession = () => {
    const nextNum = formData.syllabus.length + 1;
    setFormData(prev => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        { sessionNumber: nextNum, title: `جلسه ${nextNum}`, description: '', durationMinutes: 90 }
      ]
    }));
  };

  const removeSyllabusSession = (index: number) => {
    setFormData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index).map((s, idx) => ({ ...s, sessionNumber: idx + 1 }))
    }));
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
    if (!formData.title || !formData.slug) {
      toast.error('عنوان و شناسه (Slug) کلاس الزامی است');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      capacity: Number(formData.capacity) || 30,
      sessions: Number(formData.sessions) || formData.syllabus.length || 10,
      preRegistrationDeposit: formData.allowPreRegistration ? Number(formData.preRegistrationDeposit) : 0,
      remainingPaymentDueAfterSession: Number(formData.remainingPaymentDueAfterSession) || 2
    };

    if (editId) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const classes = classesData?.classes || (Array.isArray(classesData) ? classesData : []);
  const filteredClasses = classes.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {editId ? 'ویرایش اطلاعات کلاس' : 'تعریف کلاس جدید (آنلاین یا حضوری)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              تنظیمات تقویم زمانی، سرفصل‌ها، پیش‌ثبت‌نام بیعانه و جزئیات برگزاری
            </p>
          </div>
          <button 
            onClick={resetForm} 
            className="p-2 text-slate-400 hover:text-slate-800 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
              ۱. مشخصات کلی کلاس
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان کلاس *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="مثال: کارگاه جامع معماری میکروسرویس با Node.js"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شناسه یکتا (Slug) *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="microservices-workshop"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">توضیح کوتاه</label>
                <textarea 
                  value={formData.shortDescription} 
                  onChange={e => setFormData({...formData, shortDescription: e.target.value})} 
                  rows={2} 
                  placeholder="خلاصه هدف دوره و دستاوردهای دانشجو پس از پایان کلاس..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none" 
                />
              </div>
            </div>
          </div>

          {/* Mode & Venue / Meeting */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
              ۲. شیوه برگزاری (حضوری یا آنلاین)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع برگزاری *</label>
                <select 
                  value={formData.mode} 
                  onChange={e => setFormData({...formData, mode: e.target.value as any})} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50"
                >
                  <option value="online">🌐 آنلاین (وبینار تعاملی و وبینار زنده)</option>
                  <option value="in_person">🏢 حضوری (کارگاه در سالن / کلاس فیزیکی)</option>
                </select>
              </div>

              {formData.mode === 'online' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">پلتفرم جلسه آنلاین</label>
                    <input 
                      type="text" 
                      value={formData.meetingPlatform} 
                      onChange={e => setFormData({...formData, meetingPlatform: e.target.value})} 
                      placeholder="اسکای‌روم / گوگل میت / ادوبی کانکت"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">لینک ورود به وبینار / کلاس آنلاین</label>
                    <input 
                      type="url" 
                      value={formData.meetingLink} 
                      onChange={e => setFormData({...formData, meetingLink: e.target.value})} 
                      placeholder="https://www.skyroom.online/ch/tecyad/class-101"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono" 
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      این لینک فقط برای دانشجویانی که ثبت‌نام قطعی انجام داده‌اند نمایش داده خواهد شد.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر محل برگزاری</label>
                    <input 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      placeholder="تهران / اصفهان / شیراز..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">آدرس دقیق محل کلاس حضوری</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      placeholder="تهران، خیابان آزادی، دانشگاه صنعتی شریف، سالن همایش‌های رازی"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">مشخصات کلاس و اتاق</label>
                    <input 
                      type="text" 
                      value={formData.venueDetails} 
                      onChange={e => setFormData({...formData, venueDetails: e.target.value})} 
                      placeholder="طبقه ۳، اتاق سمینار ۱۰۴، همراه داشتن لپ‌تاپ الزامی است"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Schedule & Calendar */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
              ۳. تقویم، روزها و ساعت برگزاری
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تاریخ شروع کلاس</label>
                <input 
                  type="datetime-local" 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ساعت برگزاری هر جلسه</label>
                <input 
                  type="text" 
                  value={formData.scheduleTime} 
                  onChange={e => setFormData({...formData, scheduleTime: e.target.value})} 
                  placeholder="مثال: ۱۸:۰۰ الی ۲۰:۰۰"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">روزهای برگزاری کلاس در هفته:</label>
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
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تعداد جلسات</label>
                <input 
                  type="number" 
                  value={formData.sessions} 
                  onChange={e => setFormData({...formData, sessions: Number(e.target.value)})} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ظرفیت کلاس (نفر)</label>
                <input 
                  type="number" 
                  value={formData.capacity} 
                  onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" 
                />
              </div>
            </div>
          </div>

          {/* Pricing & Pre-registration Deposit */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
              ۴. شهریه و شرایط پیش‌ثبت‌نام (بیعانه و اقساط)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شهریه کل کلاس (تومان)</label>
                <input 
                  type="number" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  placeholder="0 برای رایگان"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono" 
                />
              </div>

              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowPreReg"
                    checked={formData.allowPreRegistration}
                    onChange={e => setFormData({...formData, allowPreRegistration: e.target.checked})}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="allowPreReg" className="text-sm font-bold text-slate-800 cursor-pointer">
                    فعال‌سازی امکان پیش‌ثبت‌نام با پرداخت بیعانه (پیش‌پرداخت)
                  </label>
                </div>

                {formData.allowPreRegistration && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        مبلغ بیعانه / پیش‌پرداخت (تومان) *
                      </label>
                      <input 
                        type="number" 
                        value={formData.preRegistrationDeposit} 
                        onChange={e => setFormData({...formData, preRegistrationDeposit: Number(e.target.value)})} 
                        placeholder="مثال: ۵۰۰,۰۰۰"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left font-mono" 
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        مانده شهریه قابل پرداخت: {(Math.max(0, formData.price - formData.preRegistrationDeposit)).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        موعد پرداخت مابقی شهریه (بعد از کدام جلسه؟) *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-medium">بعد از برگزاری جلسه</span>
                        <input 
                          type="number" 
                          min={1}
                          max={formData.sessions}
                          value={formData.remainingPaymentDueAfterSession} 
                          onChange={e => setFormData({...formData, remainingPaymentDueAfterSession: Number(e.target.value)})} 
                          className="w-20 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                        <span className="text-xs text-slate-600 font-medium">پیامک و نوتیفیکیشن تسویه ارسال شود</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions & Syllabus */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block">
                ۵. سرفصل‌ها و جلسات کلاس
              </h3>
              <button
                type="button"
                onClick={addSyllabusSession}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن جلسه جدید
              </button>
            </div>

            <div className="space-y-3">
              {formData.syllabus.map((sess, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    <input
                      type="text"
                      value={sess.title}
                      onChange={e => updateSyllabusItem(idx, 'title', e.target.value)}
                      placeholder={`عنوان جلسه ${idx + 1}...`}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={sess.description || ''}
                      onChange={e => updateSyllabusItem(idx, 'description', e.target.value)}
                      placeholder="توضیح مباحث و تمرین‌ها..."
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSyllabusSession(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition shrink-0"
                    title="حذف جلسه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending} 
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70 shadow-sm"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {editId ? 'ذخیره تغییرات کلاس' : 'ایجاد و انتشار کلاس'}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
              برنامه‌ریزی، ثبت حضور و غیاب دانشجوها، تقویم جلسات و تنظیم پیش‌ثبت‌نام بیعانه
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
            onClick={() => setShowForm(true)} 
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
          <p className="text-xs text-slate-400">می‌توانید با دکمه «تعریف کلاس جدید» اولین کلاس آنلاین یا حضوری خود را راه‌اندازی نمایید.</p>
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
                    title="ویرایش اطلاعات کلاس"
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
                        بیعانه‌ای
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
                        {cls.scheduleDays?.length ? cls.scheduleDays.join('، ') : 'روزهای تعیین شده'}
                        {cls.scheduleTime ? ` (ساعت ${cls.scheduleTime})` : ''}
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
                      <span>تعداد جلسات: <strong>{cls.sessions || 10} جلسه</strong></span>
                      <span>دانشجویان: <strong>{enrolled} نفر</strong></span>
                    </div>
                  </div>

                  {/* Attendance & Class Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Primary Button: Take Attendance */}
                    <button
                      onClick={() => setAttendanceClass(cls)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      حضور و غیاب دانشجوها ({enrolled} نفر)
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <Link 
                        href={`/classes/${cls.slug || cls._id}`} 
                        className="text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        صفحه عمومی
                      </Link>

                      {isOnline && cls.meetingLink ? (
                        <a 
                          href={cls.meetingLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          ورود استاد
                        </a>
                      ) : (
                        <button 
                          onClick={() => handleEdit(cls)}
                          className="text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                        >
                          ویرایش تنظیمات
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

      {/* Attendance Modal */}
      {attendanceClass && (
        <AttendanceModal
          classItem={attendanceClass}
          onClose={() => setAttendanceClass(null)}
          isAdmin={false}
        />
      )}

    </div>
  );
}
