'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  ArrowRight, 
  ShieldCheck, 
  Loader2, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  role?: string;
}

export default function AdminEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    status: 'active' as 'active' | 'blocked'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const { data: adminsData, isLoading: adminLoading } = useQuery({
    queryKey: ['superAdminAdmins'],
    queryFn: () => superAdminApi.getAdmins().then((res: any) => res?.data || res)
  });

  const currentAdmin = adminsData?.find((a: any) => a._id === id);

  useEffect(() => {
    if (currentAdmin) {
      setFormData({
        firstName: currentAdmin.firstName || '',
        lastName: currentAdmin.lastName || '',
        email: currentAdmin.email || '',
        mobile: currentAdmin.mobile || '',
        password: '',
        role: currentAdmin.role?._id || currentAdmin.role || '',
        status: currentAdmin.status || 'active'
      });
    }
  }, [currentAdmin]);

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
        if (!value.trim()) return 'شماره موبایل الزامی است';
        if (!/^09\d{9}$/.test(value.trim())) return 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
        return undefined;
      case 'password':
        if (value && value.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
        return undefined;
      case 'role':
        if (!value) return 'انتخاب نقش مدیریتی الزامی است';
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
      password: validateField('password', formData.password),
      role: validateField('role', formData.role),
    };

    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      mobile: true,
      password: true,
      role: true,
    });

    return !Object.values(newErrors).some(err => !err);
  };

  const updateMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updateAdmin(id, data),
    onSuccess: () => {
      toast.success('اطلاعات مدیر با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      router.push('/super-admin/admins');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی مدیر');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('لطفاً خطاهای فرم را برطرف نمایید');
      return;
    }

    const dataToSubmit = { ...formData };
    if (!dataToSubmit.password) {
      delete (dataToSubmit as any).password;
    }
    updateMutation.mutate(dataToSubmit);
  };

  if (adminLoading || rolesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
        <span className="text-xs text-[var(--neo-text-secondary)]">در حال بارگذاری اطلاعات مدیر...</span>
      </div>
    );
  }

  const isSuperAdminRole = currentAdmin?.role?.slug === 'super-admin';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-4">
          <Link 
            href="/super-admin/admins" 
            className="p-2.5 bg-[var(--neo-surface-2)] rounded-xl border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)] transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">
              ویرایش مدیر: {currentAdmin?.firstName} {currentAdmin?.lastName}
            </h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">تغییر اطلاعات هویتی، سطوح دسترسی و وضعیت حساب</p>
          </div>
        </div>

        {isSuperAdminRole && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            مدیر کل سیستم
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--neo-text-main)] flex items-center justify-between">
              <span>ایمیل سازمانی <span className="text-rose-500">*</span></span>
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
              <span>شماره موبایل <span className="text-rose-500">*</span></span>
              {touched.mobile && !errors.mobile && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            </label>
            <input 
              type="tel" 
              dir="ltr"
              maxLength={11}
              value={formData.mobile} 
              onChange={e => handleChange('mobile', e.target.value)} 
              onBlur={() => handleBlur('mobile')}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--neo-text-main)]">
              نقش کاربری <span className="text-rose-500">*</span>
            </label>
            <select 
              value={formData.role} 
              onChange={e => handleChange('role', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
            >
              <option value="">انتخاب نقش مدیریتی...</option>
              {rolesData?.filter((r: any) => ['super-admin', 'admin'].includes(r.slug)).map((role: any) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
            {touched.role && errors.role && (
              <p className="text-xs text-rose-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--neo-text-main)]">
              وضعیت حساب <span className="text-rose-500">*</span>
            </label>
            <select 
              value={formData.status} 
              onChange={e => handleChange('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
            >
              <option value="active">فعال (دسترسی به پنل مدیریت)</option>
              <option value="blocked">مسدود (غیرفعال‌سازی دسترسی)</option>
            </select>
          </div>
        </div>

        {/* Password */}
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
            placeholder="در صورت عدم تمایل به تغییر، خالی بگذارید" 
            className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-sm outline-none transition-all text-left ${
              touched.password && errors.password ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
            }`} 
          />
          {touched.password && errors.password ? (
            <p className="text-xs text-rose-500 mt-1">{errors.password}</p>
          ) : (
            <p className="text-[11px] text-[var(--neo-text-muted)]">حداقل ۸ کاراکتر برای رمز عبور جدید مدیر</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-[var(--neo-border)]">
          <Link
            href="/super-admin/admins"
            className="px-5 py-2.5 text-sm font-medium text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] rounded-xl transition-colors"
          >
            انصراف
          </Link>
          <button 
            type="submit" 
            disabled={updateMutation.isPending} 
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--neo-primary)] text-white font-bold text-sm rounded-xl hover:opacity-95 transition disabled:opacity-70 shadow-md cursor-pointer"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            ذخیره تغییرات مدیر
          </button>
        </div>
      </form>
    </div>
  );
}
