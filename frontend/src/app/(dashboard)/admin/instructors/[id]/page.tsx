'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  ArrowRight, 
  Loader2, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Briefcase, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Users, 
  Star, 
  Calendar,
  Sparkles
} from 'lucide-react';
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

export default function InstructorEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const { data: usersData, isLoading: userLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then((res: any) => res?.data || res)
  });

  const currentInstructor = usersData?.find((u: any) => u._id === id);

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
    if (currentInstructor) {
      setFormData({
        firstName: currentInstructor.firstName || '',
        lastName: currentInstructor.lastName || '',
        email: currentInstructor.email || '',
        mobile: currentInstructor.mobile || '',
        specialty: currentInstructor.specialty || currentInstructor.instructorProfile?.title || '',
        bio: currentInstructor.bio || currentInstructor.instructorProfile?.bio || '',
        status: currentInstructor.status || 'active',
        password: '',
        linkedin: currentInstructor.instructorProfile?.socialLinks?.linkedin || '',
        website: currentInstructor.instructorProfile?.socialLinks?.website || '',
      });
    }
  }, [currentInstructor]);

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
      case 'specialty':
        if (!value.trim()) return 'عنوان و تخصص تدریس الزامی است';
        if (value.trim().length < 3) return 'عنوان تخصص باید حداقل ۳ کاراکتر باشد';
        return undefined;
      case 'bio':
        if (value.trim() && value.trim().length < 10) {
          return 'بیوگرافی باید حداقل ۱۰ کاراکتر باشد';
        }
        return undefined;
      case 'password':
        if (value && value.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, (formData as any)[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      mobile: validateField('mobile', formData.mobile),
      specialty: validateField('specialty', formData.specialty),
      bio: validateField('bio', formData.bio),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      mobile: true,
      specialty: true,
      bio: true,
      password: true,
    });

    return !Object.values(newErrors).some(err => !!err);
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('مشخصات و پرونده استاد با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      router.back();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی اطلاعات استاد');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('لطفاً خطاهای فرم را برطرف نمایید');
      return;
    }

    const dataToSubmit: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      status: formData.status,
      title: formData.specialty,
      specialty: formData.specialty,
      bio: formData.bio,
      socialLinks: {
        linkedin: formData.linkedin,
        website: formData.website,
      }
    };

    if (formData.password) {
      dataToSubmit.password = formData.password;
    }

    updateMutation.mutate(dataToSubmit);
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
        <span className="text-xs text-[var(--neo-text-secondary)]">در حال دریافت پرونده استاد...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2.5 bg-[var(--neo-surface-2)] rounded-xl border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">
              ویرایش پرونده استاد: {currentInstructor?.firstName} {currentInstructor?.lastName}
            </h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-0.5">
              مدیریت عنوان تخصصی، رزومه، اطلاعات تماس و وضعیت فعالیت آموزشی
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
            formData.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            formData.status === 'blocked' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {formData.status === 'active' ? 'استاد فعال' : 'حساب مسدود'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Edit Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
          <h2 className="text-base font-bold text-[var(--neo-text-main)] flex items-center gap-2 border-b border-[var(--neo-border)] pb-4">
            <Briefcase className="w-5 h-5 text-amber-600" />
            مشخصات هویتی و حوزه تخصصی
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span>نام <span className="text-rose-500">*</span></span>
                {touched.firstName && !errors.firstName && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={e => handleChange('firstName', e.target.value)} 
                onBlur={() => handleBlur('firstName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all ${
                  touched.firstName && errors.firstName ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`} 
              />
              {touched.firstName && errors.firstName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span>نام خانوادگی <span className="text-rose-500">*</span></span>
                {touched.lastName && !errors.lastName && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={e => handleChange('lastName', e.target.value)} 
                onBlur={() => handleBlur('lastName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all ${
                  touched.lastName && errors.lastName ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`} 
              />
              {touched.lastName && errors.lastName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Specialty / Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
              <span>عنوان شغلی و تخصص اصلی <span className="text-rose-500">*</span></span>
              {touched.specialty && !errors.specialty && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </label>
            <input 
              type="text" 
              value={formData.specialty} 
              onChange={e => handleChange('specialty', e.target.value)} 
              onBlur={() => handleBlur('specialty')}
              placeholder="مثال: مدرس ارشد مهندسی نرم‌افزار، ریکت و نکست‌جی‌اس"
              className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all ${
                touched.specialty && errors.specialty ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
              }`} 
            />
            {touched.specialty && errors.specialty && (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.specialty}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span>ایمیل کاری <span className="text-rose-500">*</span></span>
                {touched.email && !errors.email && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input 
                type="email" 
                dir="ltr"
                value={formData.email} 
                onChange={e => handleChange('email', e.target.value)} 
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all text-left ${
                  touched.email && errors.email ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`} 
              />
              {touched.email && errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span>شماره تماس</span>
                {touched.mobile && !errors.mobile && formData.mobile && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </label>
              <input 
                type="tel" 
                dir="ltr"
                maxLength={11}
                value={formData.mobile} 
                onChange={e => handleChange('mobile', e.target.value)} 
                onBlur={() => handleBlur('mobile')}
                placeholder="09123456789"
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all text-left ${
                  touched.mobile && errors.mobile ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`} 
              />
              {touched.mobile && errors.mobile && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.mobile}
                </p>
              )}
            </div>
          </div>

          {/* Bio & Resume */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--neo-text-main)]">
              بیوگرافی، سوابق حرفه‌ای و مدارک علمی
            </label>
            <textarea 
              rows={4}
              value={formData.bio} 
              onChange={e => handleChange('bio', e.target.value)}
              onBlur={() => handleBlur('bio')}
              placeholder="توضیحاتی کامل درباره سوابق تدریس، پروژه‌های شاخص، مدارک دانشگاهی و مهارت‌های تدریس..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20 leading-relaxed"
            />
            {touched.bio && errors.bio && (
              <p className="text-xs text-rose-500 mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                آدرس پروفایل لینکدین (اختیاری)
              </label>
              <input 
                type="url" 
                dir="ltr"
                value={formData.linkedin} 
                onChange={e => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20 text-left"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                وبسایت یا رزومه آنلاین (اختیاری)
              </label>
              <input 
                type="url" 
                dir="ltr"
                value={formData.website} 
                onChange={e => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20 text-left"
              />
            </div>
          </div>

          {/* Account Status & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-[var(--neo-border)]">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)]">
                وضعیت حساب استاد <span className="text-rose-500">*</span>
              </label>
              <select 
                value={formData.status} 
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
              >
                <option value="active">فعال (امکان تدریس و بارگذاری دوره)</option>
                <option value="blocked">مسدود (تعلیق دسترسی)</option>
                <option value="pending">در انتظار تایید مدارک</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--neo-text-main)]">
                تغییر رمز عبور (اختیاری)
              </label>
              <input 
                type="password" 
                dir="ltr"
                value={formData.password} 
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="در صورت عدم تغییر، خالی بگذارید" 
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all text-left ${
                  touched.password && errors.password ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`} 
              />
              {touched.password && errors.password ? (
                <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
              ) : (
                <p className="text-[11px] text-[var(--neo-text-muted)]">حداقل ۶ کاراکتر برای رمز عبور جدید</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--neo-border)]">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending} 
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--neo-primary)] text-white font-bold text-sm rounded-xl hover:opacity-95 transition disabled:opacity-70 shadow-md cursor-pointer"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ذخیره پرونده استاد
            </button>
          </div>
        </form>

        {/* Instructor Summary & Academic Records */}
        <div className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 shadow-sm border border-[var(--neo-border)] space-y-5">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)] pb-3 border-b border-[var(--neo-border)]">
              شناسنامه آموزشی استاد
            </h3>

            {/* Profile Picture */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-amber-300 shadow-sm">
                {currentInstructor?.avatar ? (
                  <img src={currentInstructor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentInstructor?.firstName?.charAt(0) || 'I'
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--neo-text-main)]">
                  {currentInstructor?.firstName} {currentInstructor?.lastName}
                </div>
                <div className="text-xs text-[var(--neo-text-muted)] mt-0.5">
                  {formData.specialty || 'مدرس تک‌یاد'}
                </div>
              </div>
            </div>

            {/* Metric Boxes */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--neo-surface-2)]/60 text-xs">
                <span className="text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  دوره‌های تحت تدریس:
                </span>
                <span className="font-bold text-[var(--neo-text-main)]">
                  {currentInstructor?.coursesCount || 0} دوره فعال
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--neo-surface-2)]/60 text-xs">
                <span className="text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" />
                  تعداد کل دانشجویان:
                </span>
                <span className="font-bold text-[var(--neo-text-main)]">
                  {(currentInstructor?.totalStudentsCount || currentInstructor?.instructorProfile?.totalStudents || 0).toLocaleString('fa-IR')} دانشجو
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--neo-surface-2)]/60 text-xs">
                <span className="text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  امتیاز ارزیابی:
                </span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  ۵ / {currentInstructor?.instructorProfile?.rating || 5}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--neo-surface-2)]/60 text-xs">
                <span className="text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  تاریخ عضویت:
                </span>
                <span className="font-bold text-[var(--neo-text-main)]">
                  {currentInstructor?.createdAt ? new Date(currentInstructor.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                </span>
              </div>
            </div>

            {/* ID footer */}
            <div className="pt-2 text-[11px] text-[var(--neo-text-muted)] border-t border-[var(--neo-border)]">
              شناسه استاد: <span className="font-mono">{currentInstructor?._id}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
