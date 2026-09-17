'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Tag, Plus, Trash2, Loader2, Calendar, Users, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: () => adminApi.getCoupons().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCoupon(data),
    onSuccess: () => {
      toast.success('کد تخفیف با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      setIsModalOpen(false);
      setFormData({ code: '', type: 'percentage', value: '', usageLimit: '' });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کد تخفیف');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success('کد تخفیف حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('لطفاً فیلدهای ضروری را پر کنید');
      return;
    }
    createMutation.mutate({
      ...formData,
      value: Number(formData.value),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Tag className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900">مدیریت کدهای تخفیف</h1>
            <p className="text-gray-500 text-sm mt-1">ساخت و مدیریت کمپین‌های تخفیفی</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          کد تخفیف جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons?.map((coupon: any) => (
          <div key={coupon._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform -z-10"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="px-4 py-2 bg-purple-100 text-purple-700 font-black text-lg rounded-xl font-mono tracking-wider border border-purple-200">
                {coupon.code}
              </div>
              <button 
                onClick={() => {
                  if (confirm('آیا از حذف این کد تخفیف مطمئن هستید؟')) {
                    deleteMutation.mutate(coupon._id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> میزان تخفیف</span>
                <span className="font-bold text-gray-900">
                  {coupon.type === 'percentage' ? `${coupon.value}٪` : `${coupon.value.toLocaleString()} تومان`}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><Users className="w-4 h-4" /> استفاده شده</span>
                <span className="font-bold text-gray-900">
                  {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'نفر'}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> وضعیت</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                  {coupon.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {(!coupons || coupons.length === 0) && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">هیچ کد تخفیفی یافت نشد.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-900 text-lg">ایجاد کد تخفیف جدید</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Trash2 className="w-5 h-5 hidden" /> 
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">کد تخفیف (انگلیسی)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-left font-mono"
                  placeholder="e.g. YALDA1403"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">نوع تخفیف</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="percentage">درصدی</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">میزان ({formData.type === 'percentage' ? 'درصد' : 'تومان'})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">محدودیت تعداد استفاده (اختیاری)</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-left"
                  placeholder="بدون محدودیت"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ذخیره'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
