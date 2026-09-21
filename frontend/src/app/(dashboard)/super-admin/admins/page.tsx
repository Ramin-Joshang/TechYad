'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { Shield, Plus, Search, Filter, MoreVertical, Edit, ShieldAlert, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminsManagementPage() {
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: adminsData, isLoading } = useQuery({
    queryKey: ['superAdminAdmins'],
    queryFn: () => superAdminApi.getAdmins().then((res: any) => res?.data || res)
  });

  const { data: rolesData } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      setUpdatingId(id);
      return superAdminApi.updateAdminStatus(id, status);
    },
    onSuccess: () => {
      toast.success('وضعیت حساب مدیر با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminAdmins'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی وضعیت');
    },
    onSettled: () => {
      setUpdatingId(null);
    }
  });

  const getRoleName = (roleSlug: string) => {
    const role = rolesData?.find((r: any) => r.slug === roleSlug);
    return role?.name || roleSlug;
  };

  const filteredAdmins = adminsData?.filter((admin: any) => {
    return admin.firstName?.includes(search) || 
           admin.lastName?.includes(search) || 
           admin.email?.includes(search) ||
           admin.mobile?.includes(search);
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیران و کارکنان</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">مدیریت اعضای تیم، نقش‌ها و دسترسی‌ها</p>
          </div>
        </div>
        
        <Link 
          href="/super-admin/admins/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-medium rounded-xl transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          افزودن مدیر جدید
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)]" />
          <input 
            type="text" 
            placeholder="جستجو در نام، ایمیل یا شماره موبایل..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-white border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[var(--neo-border)] text-[var(--neo-text-main)] font-medium rounded-xl hover:bg-[var(--neo-surface-2)] transition-colors shrink-0">
          <Filter className="w-5 h-5" />
          فیلترها
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" /></div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center text-[var(--neo-text-muted)] mb-4">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-1">مدیری یافت نشد</h3>
            <p className="text-[var(--neo-text-secondary)]">موردی با جستجوی شما مطابقت نداشت.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-[var(--neo-surface-2)]/50 border-b border-[var(--neo-border)] text-sm text-[var(--neo-text-secondary)] font-medium">
                  <th className="p-4 pl-0 whitespace-nowrap">مشخصات مدیر</th>
                  <th className="p-4 whitespace-nowrap">شماره تماس / ایمیل</th>
                  <th className="p-4 whitespace-nowrap">نقش</th>
                  <th className="p-4 whitespace-nowrap">وضعیت</th>
                  <th className="p-4 text-left whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredAdmins.map((admin: any) => (
                  <tr key={admin._id} className="hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold shrink-0">
                          {admin.avatar ? (
                            <img src={admin.avatar} alt={admin.firstName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            admin.firstName?.charAt(0) || 'A'
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--neo-text-main)]">{admin.firstName} {admin.lastName}</div>
                          <div className="text-xs text-[var(--neo-text-secondary)] mt-0.5">ثبت‌نام: {new Date(admin.createdAt).toLocaleDateString('fa-IR')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-[var(--neo-text-main)]">{admin.mobile || '---'}</div>
                      <div className="text-xs text-[var(--neo-text-secondary)]">{admin.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                        admin.role?.slug === 'super-admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role?.slug === 'super-admin' && <Shield className="w-3.5 h-3.5" />}
                        {admin.role?.name || admin.role?.slug}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.status === 'active' ? 'فعال' : 'مسدود'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end items-center gap-2">
                        {/* Status Toggle / Activation Button */}
                        {admin.status !== 'active' ? (
                          <button
                            onClick={() => updateStatusMutation.mutate({ 
                              id: admin._id, 
                              status: 'active' 
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="p-2 rounded-xl transition-all text-emerald-600 hover:bg-emerald-50 disabled:opacity-60 flex items-center justify-center"
                            title="فعال‌سازی حساب مدیر"
                          >
                            {updatingId === admin._id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            ) : (
                              <CheckCircle className="w-5 h-5" />
                            )}
                          </button>
                        ) : admin.role?.slug !== 'super-admin' ? (
                          <button
                            onClick={() => updateStatusMutation.mutate({ 
                              id: admin._id, 
                              status: 'blocked' 
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="p-2 rounded-xl transition-all text-rose-600 hover:bg-rose-50 disabled:opacity-60 flex items-center justify-center"
                            title="مسدود کردن حساب مدیر"
                          >
                            {updatingId === admin._id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </button>
                        ) : (
                          <span className="p-2 text-emerald-600/70" title="مدیر کل سیستم (فعال و مصون از مسدودسازی)">
                            <CheckCircle className="w-5 h-5 opacity-40" />
                          </span>
                        )}
                        <Link 
                          href={`/super-admin/admins/${admin._id}`} 
                          className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)] rounded-xl transition-colors"
                          title="ویرایش اطلاعات مدیر"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
