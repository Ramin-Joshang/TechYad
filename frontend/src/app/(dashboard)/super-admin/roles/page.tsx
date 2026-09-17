'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { Key, Plus, Search, Edit, Trash2, Copy, Shield, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RolesManagementPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['superAdminRolesList'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.deleteRole(id),
    onSuccess: () => {
      toast.success('نقش با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminRolesList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف نقش');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`آیا از حذف نقش "${name}" اطمینان دارید؟`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredRoles = rolesData?.filter((role: any) => {
    return role.name?.includes(search) || role.slug?.includes(search);
  }) || [];

  const systemRoles = ['super-admin', 'admin', 'instructor', 'student', 'support'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">نقش‌ها و دسترسی‌ها</h1>
            <p className="text-gray-500 text-sm mt-1">مدیریت پویای سطوح دسترسی (RBAC)</p>
          </div>
        </div>
        
        <Link 
          href="/super-admin/roles/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          افزودن نقش جدید
        </Link>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900">توجه: مدیریت نقش‌های سیستمی</h4>
          <p className="text-sm text-amber-700 mt-1 leading-relaxed">
            نقش‌های پیش‌فرض سیستم (مثل دانشجو، استاد، ادمین) محافظت‌شده هستند و امکان حذف یا تغییر نام آن‌ها وجود ندارد. اما می‌توانید سطوح دسترسی (Permissions) آن‌ها را ویرایش کنید. نقش Super Admin بالاترین سطح دسترسی است و به هیچ وجه قابل ویرایش نیست.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="جستجو در نام نقش‌ها..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
        ) : filteredRoles.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Key className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">نقشی یافت نشد</h3>
            <p className="text-gray-500">موردی با جستجوی شما مطابقت نداشت.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 font-medium">
                  <th className="p-4 pl-0 whitespace-nowrap">عنوان نقش</th>
                  <th className="p-4 whitespace-nowrap">کاربران (تعداد)</th>
                  <th className="p-4 whitespace-nowrap">نوع</th>
                  <th className="p-4 text-left whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoles.map((role: any) => {
                  const isSystem = systemRoles.includes(role.slug);
                  
                  return (
                    <tr key={role._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{role.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{role.description || role.slug}</div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {role.userCount || 0} کاربر
                        </div>
                      </td>
                      <td className="p-4">
                        {isSystem ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">
                            <Shield className="w-3.5 h-3.5" />
                            سیستمی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            سفارشی
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end items-center gap-2">
                          <Link 
                            href={`/super-admin/roles/create?clone=${role._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="کپی کردن نقش (Clone)"
                          >
                            <Copy className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/super-admin/roles/${role._id}`}
                            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            title="ویرایش"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          {!isSystem && (
                            <button 
                              onClick={() => handleDelete(role._id, role.name)}
                              disabled={deleteMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                              title="حذف"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
