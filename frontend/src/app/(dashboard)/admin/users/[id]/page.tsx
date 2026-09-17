'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { ArrowRight, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;
  const { data: rolesData } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => adminApi.getRoles().then((res: any) => res?.data || res).catch(() => [])
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    status: 'active',
    role: '',
  });

  const { data: usersData, isLoading: userLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then((res: any) => res?.data || res)
  });

  useEffect(() => {
    if (usersData && id) {
      const user = usersData.find((a: any) => a._id === id);
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          mobile: user.mobile || '',
          password: '',
          status: user.status || 'active',
          role: user.role?._id || user.role || '',
        });
      }
    }
  }, [usersData, id]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('اطلاعات کاربر با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      router.back();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی کاربر');
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

  if (userLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">ویرایش کاربر</h1>
          <p className="text-gray-500 text-sm mt-1">ویرایش اطلاعات دانشجویان / اساتید / کاربران عمومی</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور جدید (اختیاری)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="در صورت عدم تغییر، خالی بگذارید" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">وضعیت <span className="text-red-500">*</span></label>
            <select required name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="active">فعال</option>
              <option value="blocked">مسدود</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نقش کاربری <span className="text-red-500">*</span></label>
            <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">انتخاب نقش...</option>
              {rolesData?.map((role: any) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
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
