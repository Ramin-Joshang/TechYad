'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { Loader2, Plus, Edit, Trash2, List } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', icon: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories().then((res: any) => res?.data || res)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => catalogApi.createCategory(data),
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFormData({ name: '', slug: '', description: '', icon: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ایجاد دسته‌بندی')
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => catalogApi.updateCategory(editId!, data),
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditId(null);
      setFormData({ name: '', slug: '', description: '', icon: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ویرایش دسته‌بندی')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('دسته‌بندی حذف شد');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => toast.error('خطا در حذف دسته‌بندی')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (cat: any) => {
    setEditId(cat._id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || ''
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', slug: '', description: '', icon: '' });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><List className="w-6 h-6" /></div>
        <div>
          <h1 className="text-xl font-black text-gray-900">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-gray-500 text-sm mt-1">ایجاد، ویرایش و حذف دسته‌بندی دوره‌ها و کلاس‌ها</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{editId ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان دسته‌بندی <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="مثال: برنامه‌نویسی وب" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">شناسه (Slug) <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" placeholder="web-development" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">توضیحات</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button type="submit" disabled={isPending} className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : editId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editId ? 'بروزرسانی' : 'ثبت دسته‌بندی'}
              </button>
              {editId && (
                <button type="button" onClick={cancelEdit} className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition">انصراف</button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-gray-500">هیچ دسته‌بندی یافت نشد.</div>
            ) : (
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-4 font-bold text-gray-600 text-sm">عنوان</th>
                    <th className="p-4 font-bold text-gray-600 text-sm">شناسه (Slug)</th>
                    <th className="p-4 font-bold text-gray-600 text-sm text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((cat: any) => (
                    <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                      <td className="p-4 text-gray-500 dir-ltr text-right">{cat.slug}</td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(window.confirm('آیا از حذف اطمینان دارید؟')) deleteMutation.mutate(cat._id) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
