'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  ArrowRight, Loader2, Save, User, Mail, Phone, Lock, Briefcase, 
  FileText, Globe, CheckCircle2, AlertCircle, BookOpen, Users, 
  Star, Calendar, Video, ExternalLink, DollarSign, Layers, Check, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  specialty?: string;
  bio?: string;
  password?: string;
}

export default function InstructorDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'classes' | 'edit'>('overview');

  // Fetch full aggregated data
  const { data: userDetails, isLoading, isError } = useQuery({
    queryKey: ['adminInstructorDetail', id],
    queryFn: async () => {
      const res = await adminApi.getUserById(id);
      return res.data?.data || res.data;
    }
  });

  const user = userDetails?.user;
  const instructorProfile = userDetails?.instructorProfile;
  const courses = userDetails?.courses || [];
  const classes = userDetails?.classes || [];
  const stats = userDetails?.stats || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    specialty: '',
    bio: '',
    status: 'active',
    password: '',
    linkedin: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        specialty: user.specialty || instructorProfile?.title || '',
        bio: user.bio || instructorProfile?.bio || '',
        status: user.status || 'active',
        password: '',
        linkedin: instructorProfile?.socialLinks?.linkedin || '',
        website: instructorProfile?.socialLinks?.website || '',
      });
    }
  }, [user, instructorProfile]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'نام الزامی است';
        if (value.trim().length < 2) return 'نام باید حداقل ۲ کاراکتر باشد';
        return undefined;
      case 'lastName':
        if (!value.trim()) return 'نام خانوادگی الزامی است';
        if (value.trim().length < 2) return 'نام خانوادگی باید حداقل ۲ کاراکتر باشد';
        return undefined;
      case 'email':
        if (!value.trim()) return 'ایمیل الزامی است';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'فرمت ایمیل نامعتبر است';
        return undefined;
      case 'mobile':
        if (value.trim() && !/^09\d{9}$/.test(value.trim())) {
          return 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
        }
        return undefined;
      case 'password':
        if (value && value.length < 6) return 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, (formData as any)[name]);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('اطلاعات استاد با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminInstructorDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminInstructors'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی استاد');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: string) => adminApi.updateUser(id, { status: newStatus }),
    onSuccess: () => {
      toast.success('وضعیت حساب استاد تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['adminInstructorDetail', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, (formData as any)[key]);
      if (err) (newErrors as any)[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ firstName: true, lastName: true, email: true, mobile: true, password: true });
      toast.error('لطفاً خطاهای فرم را برطرف فرمایید');
      return;
    }

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      status: formData.status,
      specialty: formData.specialty,
      bio: formData.bio,
      socialLinks: {
        linkedin: formData.linkedin,
        website: formData.website
      }
    };
    if (formData.password) payload.password = formData.password;

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
        <p className="text-sm font-bold text-[var(--neo-text-secondary)]">درحال دریافت کارنامه و پرونده کامل استاد...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-[var(--neo-text-main)]">استاد مورد نظر یافت نشد</h2>
        <button onClick={() => router.back()} className="px-5 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl">
          بازگشت به فهرست اساتید
        </button>
      </div>
    );
  }

  const totalStudents = stats.totalStudents || instructorProfile?.totalStudents || 0;
  const rating = instructorProfile?.rating || 4.9;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-[var(--neo-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-[var(--neo-surface-2)] rounded-2xl hover:bg-[var(--neo-border)] transition text-[var(--neo-text-secondary)]"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden border-2 border-white/20">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` || 'I'
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[var(--neo-text-main)]">
                استاد {user.firstName} {user.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {formData.specialty || 'مدرس ارشد'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {user.status === 'active' ? 'حساب فعال' : 'غیرفعال / مسدود'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)] mt-1.5 flex-wrap">
              <span>ایمیل: {user.email}</span>
              {user.mobile && <span>موبایل: {user.mobile}</span>}
              <span>عضویت: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
            </div>
          </div>
        </div>

        {/* Status Toggle Button */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => toggleStatusMutation.mutate(user.status === 'active' ? 'inactive' : 'active')}
            disabled={toggleStatusMutation.isPending}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm ${
              user.status === 'active' 
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {toggleStatusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.status === 'active' ? (
              <>
                <X className="w-4 h-4" /> غیرفعال‌سازی تدریس
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> فعال‌سازی تدریس استاد
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">دوره‌های تدریس</span>
            <h4 className="text-xl font-black text-[var(--neo-text-main)]">{courses.length}</h4>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Video className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کلاس‌های آنلاین/حضوری</span>
            <h4 className="text-xl font-black text-blue-600">{classes.length}</h4>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کل دانشجویان استاد</span>
            <h4 className="text-xl font-black text-indigo-600">{totalStudents} نفر</h4>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Star className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">امتیاز رضایت</span>
            <h4 className="text-xl font-black text-emerald-600">{rating} / ۵</h4>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--neo-border)] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> رزومه و سوابق استاد
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'courses' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> دوره‌های تولید شده ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'classes' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <Video className="w-3.5 h-3.5" /> کلاس‌ها و کارگاه‌ها ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'edit' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <Save className="w-3.5 h-3.5" /> ویرایش مشخصات استاد
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] space-y-5">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">بیوگرافی و تخصص</h3>
            <p className="p-4 bg-[var(--neo-surface-2)] rounded-2xl text-xs text-[var(--neo-text-secondary)] leading-relaxed">
              {formData.bio || 'توضیحات و بیوگرافی برای این استاد ثبت نشده است.'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">تخصص اصلی:</span>
                <span className="font-bold text-[var(--neo-text-main)]">{formData.specialty || 'نامشخص'}</span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">لینکداین:</span>
                <span className="font-bold text-[var(--neo-text-main)] dir-ltr text-right truncate block">
                  {formData.linkedin || 'ثبت نشده'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">دسترسی‌های سریع</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('edit')}
                className="w-full py-2.5 px-4 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl text-xs font-bold text-right flex items-center justify-between transition"
              >
                <span>ویرایش اطلاعات و سوابق استاد</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className="w-full py-2.5 px-4 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl text-xs font-bold text-right flex items-center justify-between transition"
              >
                <span>مشاهده و مدیریت دوره‌های استاد</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)]">دوره‌های آموزشی تولید شده توسط استاد</h3>
          {courses.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
              هنوز دوره‌ای برای این استاد تعریف نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c: any) => (
                <div key={c._id} className="p-4 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={c.thumbnail || `https://picsum.photos/seed/${c._id}/100/60`} 
                      alt={c.title} 
                      className="w-14 h-10 object-cover rounded-lg border border-[var(--neo-border)] shrink-0" 
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[var(--neo-text-main)]">{c.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--neo-text-muted)] mt-1">
                        <span>قیمت: {c.price ? `${Number(c.price).toLocaleString()} تومان` : 'رایگان'}</span>
                        <span>•</span>
                        <span>وضعیت: {c.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/courses/${c.slug || c._id}`}
                      target="_blank"
                      className="p-2 bg-[var(--neo-surface)] text-blue-600 rounded-xl"
                      title="مشاهده در سایت"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/instructor/courses/${c._id}/edit`}
                      className="p-2 bg-[var(--neo-surface)] text-purple-600 rounded-xl"
                      title="ویرایش سرفصل‌ها و جلسات"
                    >
                      <Layers className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Classes */}
      {activeTab === 'classes' && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)]">کلاس‌های آنلاین و حضوری استاد</h3>
          {classes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
              هنوز کلاسی برای این استاد ثبت نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls: any) => (
                <div key={cls._id} className="p-4 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-[var(--neo-text-main)]">{cls.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--neo-text-muted)] mt-1">
                      <span>شیوه: {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}</span>
                      <span>•</span>
                      <span>ظرفیت: {cls.capacity || 50} نفر</span>
                    </div>
                  </div>
                  <Link
                    href={`/classes/${cls.slug || cls._id}`}
                    target="_blank"
                    className="p-2 bg-[var(--neo-surface)] text-emerald-600 rounded-xl"
                    title="مشاهده در سایت"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Edit Form */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 border border-[var(--neo-border)] space-y-6">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)] pb-3 border-b border-[var(--neo-border)]">
            ویرایش کامل مشخصات، سوابق و کلمه عبور استاد
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نام *</label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={e => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] ${
                  touched.firstName && errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.firstName && errors.firstName && <p className="text-[10px] text-rose-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نام خانوادگی *</label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={e => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] ${
                  touched.lastName && errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.lastName && errors.lastName && <p className="text-[10px] text-rose-500 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">ایمیل *</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left ${
                  touched.email && errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.email && errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">شماره تماس همراه</label>
              <input 
                type="tel" 
                value={formData.mobile} 
                onChange={e => handleChange('mobile', e.target.value)}
                onBlur={() => handleBlur('mobile')}
                placeholder="09123456789"
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left ${
                  touched.mobile && errors.mobile ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.mobile && errors.mobile && <p className="text-[10px] text-rose-500 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">تخصص / عنوان تدریس</label>
              <input 
                type="text" 
                value={formData.specialty} 
                onChange={e => handleChange('specialty', e.target.value)}
                placeholder="مثال: مدرس ارشد معماری نرم‌افزار"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)]" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">رمز عبور جدید (در صورت نیاز به تغییر)</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => handleChange('password', e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">پروفایل لینکداین</label>
              <input 
                type="text" 
                value={formData.linkedin} 
                onChange={e => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none dir-ltr text-left" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">وب‌سایت شخصی</label>
              <input 
                type="text" 
                value={formData.website} 
                onChange={e => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none dir-ltr text-left" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">رزومه و بیوگرافی استاد</label>
            <textarea 
              rows={4}
              value={formData.bio} 
              onChange={e => handleChange('bio', e.target.value)}
              placeholder="سوابق تحصیلی، شغلی، دوره‌ها و پروژه‌های شاخص..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--neo-border)]">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-2.5 bg-[var(--neo-primary)] hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ذخیره تغییرات استاد
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
