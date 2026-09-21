'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, User, Mail, Phone, Lock, Check, Loader2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  role?: string;
}

export default function CreateAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    status: 'active' as 'active' | 'blocked',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const adminRoles = rolesData?.filter((r: any) => ['admin', 'super-admin'].includes(r.slug)) || [];

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
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'فرمت آدرس ایمیل نامعتبر است';
        return undefined;
      case 'mobile':
        if (!value.trim()) return 'شماره موبایل الزامی است';
        if (!/^09\d{9}$/.test(value.trim())) return 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
        return undefined;
      case 'password':
        if (!value) return 'رمز عبور الزامی است';
        if (value.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
        return undefined;
      case 'role':
        if (!value) return 'لطفاً یک نقش مدیریتی انتخاب کنید';
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

    return !Object.values(newErrors).some(err => !!err);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.createAdmin(data),
    onSuccess: () => {
      toast.success('مدیر جدید با موفقیت ایجاد و فعال شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      router.push('/super-admin/admins');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد مدیر');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast.error('لطفاً خطاهای فرم را برطرف نمایید');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-4">
          <Link 
            href="/super-admin/admins" 
            className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)] rounded-xl transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">افزودن مدیر جدید</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">ساخت حساب کاربری با دسترسی‌های مدیریتی و نظارتی</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--neo-primary)]" />
                  نام <span className="text-rose-500">*</span>
                </span>
                {touched.firstName && !errors.firstName && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full px-4 py-3 bg-[var(--neo-surface-2)] border rounded-xl outline-none transition-all ${
                  touched.firstName && errors.firstName 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' 
                    : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`}
                placeholder="مثال: علی"
              />
              {touched.firstName && errors.firstName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.firstName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--neo-primary)]" />
                  نام خانوادگی <span className="text-rose-500">*</span>
                </span>
                {touched.lastName && !errors.lastName && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full px-4 py-3 bg-[var(--neo-surface-2)] border rounded-xl outline-none transition-all ${
                  touched.lastName && errors.lastName 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' 
                    : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`}
                placeholder="مثال: محمدی"
              />
              {touched.lastName && errors.lastName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--neo-primary)]" />
                  آدرس ایمیل <span className="text-rose-500">*</span>
                </span>
                {touched.email && !errors.email && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </label>
              <input
                type="email"
                dir="ltr"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-3 bg-[var(--neo-surface-2)] border rounded-xl outline-none transition-all text-left ${
                  touched.email && errors.email 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' 
                    : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`}
                placeholder="admin@example.com"
              />
              {touched.email && errors.email && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--neo-primary)]" />
                  شماره موبایل <span className="text-rose-500">*</span>
                </span>
                {touched.mobile && !errors.mobile && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </label>
              <input
                type="tel"
                dir="ltr"
                maxLength={11}
                value={formData.mobile}
                onChange={e => handleChange('mobile', e.target.value)}
                onBlur={() => handleBlur('mobile')}
                className={`w-full px-4 py-3 bg-[var(--neo-surface-2)] border rounded-xl outline-none transition-all text-left ${
                  touched.mobile && errors.mobile 
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' 
                    : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
                }`}
                placeholder="09123456789"
              />
              {touched.mobile && errors.mobile && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.mobile}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--neo-primary)]" />
                رمز عبور اولیه <span className="text-rose-500">*</span>
              </span>
              {touched.password && !errors.password && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </label>
            <input
              type="password"
              dir="ltr"
              value={formData.password}
              onChange={e => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`w-full px-4 py-3 bg-[var(--neo-surface-2)] border rounded-xl outline-none transition-all text-left ${
                touched.password && errors.password 
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' 
                  : 'border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)]'
              }`}
              placeholder="حداقل ۸ کاراکتر شامل حروف و اعداد"
            />
            {touched.password && errors.password ? (
              <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password}
              </p>
            ) : (
              <p className="text-xs text-[var(--neo-text-muted)]">رمز عبور باید حداقل ۸ کاراکتر باشد.</p>
            )}
          </div>

          {/* Account Status Toggle - Requested by User */}
          <div className="p-5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  فعال‌سازی فوری حساب کاربری
                </div>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                  با فعال بودن این گزینه، حساب مدیر جدید بلافاصله آماده ورود و تایید شده خواهد بود.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  status: prev.status === 'active' ? 'blocked' : 'active' 
                }))}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                  formData.status === 'active' ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    formData.status === 'active' ? '-translate-x-6' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--neo-text-secondary)]">وضعیت جاری:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${
                formData.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {formData.status === 'active' ? 'حساب فعال است' : 'حساب مسدود/غیرفعال است'}
              </span>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Key className="w-4 h-4 text-[var(--neo-primary)]" />
                انتخاب نقش مدیریتی <span className="text-rose-500">*</span>
              </label>
              {touched.role && errors.role && (
                <span className="text-xs text-rose-500">{errors.role}</span>
              )}
            </div>
            
            {isLoadingRoles ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminRoles.map((role: any) => (
                  <div 
                    key={role._id}
                    onClick={() => {
                      handleChange('role', role._id);
                      setTouched(prev => ({ ...prev, role: true }));
                    }}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.role === role._id 
                        ? 'border-[var(--neo-primary)] bg-[var(--neo-primary)]/5 shadow-sm ring-2 ring-[var(--neo-primary)]/20' 
                        : 'border-[var(--neo-border)] bg-[var(--neo-surface)] hover:border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${role.slug === 'super-admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[var(--neo-primary)]'}`}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-[var(--neo-text-main)]">{role.name}</span>
                      </div>
                      {formData.role === role._id && (
                        <div className="w-6 h-6 rounded-full bg-[var(--neo-primary)] text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--neo-text-secondary)] pr-11 leading-relaxed">
                      {role.description || (role.slug === 'super-admin' 
                        ? 'دسترسی کامل به تمام بخش‌های سیستم شامل امنیت، گزارشات مالی و مدیریت اعضا' 
                        : 'مدیریت کاربران، دوره‌ها و محتوای آموزشی')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Actions */}
        <div className="p-6 bg-[var(--neo-surface-2)]/60 border-t border-[var(--neo-border)] flex items-center justify-between">
          <Link 
            href="/super-admin/admins"
            className="px-6 py-2.5 text-[var(--neo-text-secondary)] font-medium hover:bg-[var(--neo-border)] rounded-xl transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-[var(--neo-primary)] hover:opacity-95 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            ثبت و ایجاد حساب مدیر
          </button>
        </div>
      </form>
    </div>
  );
}
