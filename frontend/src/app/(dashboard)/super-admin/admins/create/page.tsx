'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, User, Mail, Phone, Lock, Check, Loader2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    role: ''
  });

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const adminRoles = rolesData?.filter((r: any) => ['admin', 'super-admin'].includes(r.slug)) || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.createAdmin(data),
    onSuccess: () => {
      toast.success('مدیر جدید با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
      router.push('/super-admin/admins');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد مدیر');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      toast.error('لطفاً یک نقش را انتخاب کنید');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/admins" className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)] rounded-xl transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">افزودن مدیر جدید</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">ساخت حساب کاربری با دسترسی‌های مدیریتی</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                نام
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all"
                placeholder="مثال: علی"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                نام خانوادگی
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all"
                placeholder="مثال: محمدی"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                آدرس ایمیل
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all text-left"
                dir="ltr"
                placeholder="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                شماره موبایل
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all text-left"
                dir="ltr"
                placeholder="09123456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              رمز عبور اولیه
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all text-left"
              dir="ltr"
              placeholder="حداقل ۸ کاراکتر"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-500" />
              انتخاب نقش مدیریتی
            </label>
            
            {isLoadingRoles ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminRoles.map((role: any) => (
                  <div 
                    key={role._id}
                    onClick={() => setFormData(prev => ({ ...prev, role: role._id }))}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.role === role._id 
                        ? 'border-[var(--neo-primary)] bg-[var(--neo-primary)]/10/50' 
                        : 'border-[var(--neo-border)] bg-white hover:border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${role.slug === 'super-admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-[var(--neo-primary)]'}`}>
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
                        ? 'دسترسی کامل به تمام بخش‌های سیستم شامل امنیت و گزارشات' 
                        : 'مدیریت کاربران، دوره‌ها و محتوای آموزشی')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
        <div className="p-6 bg-[var(--neo-surface-2)] border-t border-[var(--neo-border)] flex justify-end gap-3">
          <Link 
            href="/super-admin/admins"
            className="px-6 py-3 text-[var(--neo-text-secondary)] font-medium hover:bg-[var(--neo-border)] rounded-xl transition-colors"
          >
            انصراف
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            ثبت و ایجاد حساب
          </button>
        </div>
      </form>
    </div>
  );
}
