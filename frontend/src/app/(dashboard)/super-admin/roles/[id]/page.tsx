'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Key, ArrowRight, Shield, Check, Loader2, AlertCircle, Copy, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PERMISSION_GROUPS, SYSTEM_ROLES } from '@/features/admin/constants/permissions';

export default function RoleEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const isNew = params.id === 'create';
  const cloneId = searchParams.get('clone');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [] as string[]
  });

  // Fetch role if editing or cloning
  const fetchId = cloneId || (!isNew ? params.id : null);
  
  const { data: roleData, isLoading: isLoadingRole } = useQuery({
    queryKey: ['superAdminRole', fetchId],
    queryFn: () => superAdminApi.getRoleById(fetchId as string).then((res: any) => res?.data || res),
    enabled: !!fetchId
  });

  useEffect(() => {
    if (roleData) {
      setFormData({
        name: cloneId ? `${roleData.name} (کپی)` : roleData.name,
        slug: cloneId ? `${roleData.slug}-copy` : roleData.slug,
        description: roleData.description || '',
        permissions: roleData.permissions || []
      });
    }
  }, [roleData, cloneId]);

  const isSystemRole = !isNew && !cloneId && SYSTEM_ROLES.includes(formData.slug);
  const isSuperAdminRole = !isNew && !cloneId && formData.slug === 'super-admin';

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? superAdminApi.createRole(data) : superAdminApi.updateRole(params.id as string, data),
    onSuccess: () => {
      toast.success(isNew ? 'نقش جدید با موفقیت ایجاد شد' : 'تغییرات نقش ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminRolesList'] });
      router.push('/super-admin/roles');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره نقش');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('لطفاً عنوان و شناسه نقش را وارد کنید');
      return;
    }
    
    // Check dangerous escalation client-side
    if (formData.permissions.includes('super_admin.access') && formData.slug !== 'super-admin') {
      toast.error('امکان اعطای دسترسی سوپر ادمین به نقش‌های دیگر وجود ندارد');
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleTogglePermission = (permissionId: string) => {
    if (isSuperAdminRole) return; // Cannot modify super admin
    
    setFormData(prev => {
      const isSelected = prev.permissions.includes(permissionId);
      if (isSelected) {
        return { ...prev, permissions: prev.permissions.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permissionId] };
      }
    });
  };

  const hasDangerousPermissions = formData.permissions.some(p => 
    ['users.manage', 'roles.manage', 'settings.manage', 'payments.manage'].includes(p)
  );

  if (isLoadingRole) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/roles" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowRight className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {isNew ? (cloneId ? 'کپی کردن نقش' : 'ایجاد نقش جدید') : 'ویرایش دسترسی‌های نقش'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">مدیریت دقیق سطوح دسترسی (RBAC)</p>
          </div>
        </div>
      </div>

      {isSystemRole && !isSuperAdminRole && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-indigo-900">نقش سیستمی محافظت‌شده</h4>
            <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
              این نقش یک نقش سیستمی پایه‌ای است. شما نمی‌توانید عنوان یا شناسه آن را تغییر دهید، اما می‌توانید دسترسی‌های مجاز آن را ویرایش کنید تا با سیاست‌های سیستم شما همخوانی داشته باشد.
            </p>
          </div>
        </div>
      )}

      {isSuperAdminRole && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-purple-900">دسترسی‌های ریشه (Super Admin)</h4>
            <p className="text-sm text-purple-700 mt-1 leading-relaxed">
              نقش Super Admin دارای دسترسی کامل و بی‌قید و شرط به تمام منابع سیستم است و امکان محدود کردن دسترسی‌های آن وجود ندارد.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            مشخصات نقش
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">عنوان نقش</label>
              <input
                type="text"
                required
                disabled={isSystemRole}
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                placeholder="مثال: مدیر محتوا"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">شناسه نقش (انگلیسی)</label>
              <input
                type="text"
                required
                disabled={isSystemRole}
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-left disabled:opacity-60"
                dir="ltr"
                placeholder="content-manager"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">توضیحات کوتاه</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="مثال: دسترسی‌های مرتبط با مدیریت و بررسی دوره‌های آموزشی"
            />
          </div>
        </div>

        {/* Permissions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              مدیریت دسترسی‌ها (Permissions)
            </h2>
            <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              {formData.permissions.length} دسترسی فعال
            </div>
          </div>
          
          {hasDangerousPermissions && !isSuperAdminRole && (
            <div className="mx-8 mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-sm font-medium text-amber-800">
                این نقش دارای سطوح دسترسی حساس (مدیریت کاربران، تراکنش‌ها یا تنظیمات سیستم) است. لطفاً با احتیاط تخصیص دهید.
              </span>
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {PERMISSION_GROUPS.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="font-bold text-gray-900 pb-2 border-b border-gray-100">{group.group}</h3>
                  <div className="space-y-3">
                    {group.permissions.map(perm => {
                      // If super admin, all permissions are visually checked and disabled
                      const isChecked = isSuperAdminRole || formData.permissions.includes(perm.id);
                      
                      return (
                        <label 
                          key={perm.id} 
                          className={`flex items-start gap-3 cursor-pointer group ${isSuperAdminRole ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isChecked 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-gray-300 text-transparent group-hover:border-blue-500'
                          }`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isChecked}
                            onChange={() => handleTogglePermission(perm.id)}
                            disabled={isSuperAdminRole}
                          />
                          <div>
                            <div className={`text-sm font-medium ${isChecked ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                              {perm.label}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{perm.id}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              href="/super-admin/roles"
              className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isPending || isSuperAdminRole}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
            >
              {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {isSuperAdminRole ? 'غیرقابل تغییر' : 'ثبت و ذخیره نقش'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
