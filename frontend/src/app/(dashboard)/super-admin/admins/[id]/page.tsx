'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { ArrowRight, ShieldCheck, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    role: '',
    status: 'active'
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => superAdminApi.getRoles().then((res: any) => res?.data || res)
  });

  const { data: adminsData, isLoading: adminLoading } = useQuery({
    queryKey: ['superAdminAdmins'],
    queryFn: () => superAdminApi.getAdmins().then((res: any) => res?.data || res)
  });

  useEffect(() => {
    if (adminsData && id) {
      const admin = adminsData.find((a: any) => a._id === id);
      if (admin) {
        setFormData({
          firstName: admin.firstName || '',
          lastName: admin.lastName || '',
          email: admin.email || '',
          mobile: admin.mobile || '',
          password: '',
          role: admin.role?._id || admin.role || '',
          status: admin.status || 'active'
        });
      }
    }
  }, [adminsData, id]);

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
    const dataToSubmit = { ...formData };
    if (!dataToSubmit.password) {
      delete (dataToSubmit as any).password;
    }
    updateMutation.mutate(dataToSubmit);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (adminLoading || rolesLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/admins" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">ویرایش مدیر</h1>
          <p className="text-gray-500 text-sm mt-1">تغییر اطلاعات و دسترسی‌های مدیر</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نام <span className="text-red-500">*</span></label>
            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نام خانوادگی <span className="text-red-500">*</span></label>
            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ایمیل <span className="text-red-500">*</span></label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل <span className="text-red-500">*</span></label>
            <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور جدید (اختیاری)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="در صورت عدم تغییر، خالی بگذارید" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نقش <span className="text-red-500">*</span></label>
            <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">انتخاب نقش...</option>
              {rolesData?.filter((r:any) => ['super-admin', 'admin'].includes(r.slug)).map((role: any) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">وضعیت <span className="text-red-500">*</span></label>
            <select required name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">فعال</option>
              <option value="blocked">مسدود</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-70">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </div>
  );
}
