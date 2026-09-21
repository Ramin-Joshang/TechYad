'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Tag, Plus, Trash2, Edit, Loader2, Calendar, Users, 
  DollarSign, Check, Copy, Power, Search, AlertCircle, 
  Percent, ShieldCheck, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminCouponsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '1',
    startAt: '',
    endAt: '',
    isActive: true
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['adminCoupons'],
    queryFn: async () => {
      const res = await adminApi.getCoupons();
      return res?.data || res || [];
    }
  });

  // Calculate high-level stats
  const couponStats = useMemo(() => {
    if (!coupons || !Array.isArray(coupons)) {
      return { total: 0, active: 0, totalUsed: 0, totalDiscount: 0 };
    }
    const total = coupons.length;
    const active = coupons.filter((c: any) => c.isActive && !c.isExpired).length;
    const totalUsed = coupons.reduce((sum: number, c: any) => sum + (c.usageCount || 0), 0);
    const totalDiscount = coupons.reduce((sum: number, c: any) => sum + (c.totalDiscountGiven || 0), 0);
    return { total, active, totalUsed, totalDiscount };
  }, [coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    if (!coupons || !Array.isArray(coupons)) return [];
    return coupons.filter((c: any) => {
      const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;
      if (statusFilter === 'active') return c.isActive && !c.isExpired;
      if (statusFilter === 'inactive') return !c.isActive;
      if (statusFilter === 'expired') return c.isExpired;
      return true;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingCoupon) {
        return adminApi.updateCoupon(editingCoupon._id, payload);
      }
      return adminApi.createCoupon(payload);
    },
    onSuccess: () => {
      toast.success(editingCoupon ? 'کد تخفیف ویرایش شد' : 'کد تخفیف جدید ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره کد تخفیف');
    }
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleCoupon(id),
    onSuccess: () => {
      toast.success('وضعیت کد تخفیف تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success('کد تخفیف با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کد تخفیف');
    }
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      usageLimit: '',
      perUserLimit: '1',
      startAt: new Date().toISOString().split('T')[0],
      endAt: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '',
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : '1',
      startAt: coupon.startAt ? new Date(coupon.startAt).toISOString().split('T')[0] : '',
      endAt: coupon.endAt ? new Date(coupon.endAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.value) {
      toast.error('لطفاً فیلدهای ضروری را پر کنید');
      return;
    }

    const payload: any = {
      code: formData.code.trim().toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : 1,
      startAt: formData.startAt ? new Date(formData.startAt) : undefined,
      endAt: formData.endAt ? new Date(formData.endAt) : undefined,
      isActive: formData.isActive
    };

    saveMutation.mutate(payload);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`کد «${code}» کپی شد`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--neo-text-main)]">مدیریت کدهای تخفیف و کمپین‌ها</h1>
              <p className="text-[var(--neo-text-secondary)] text-sm mt-1">ایجاد، کنترل و مشاهده گزارش‌های مالی و مصرف تخفیف‌ها</p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          کد تخفیف جدید
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-[var(--neo-text-secondary)] mb-1">کل کدهای تخفیف</div>
          <div className="text-2xl font-black text-[var(--neo-text-main)]">{couponStats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 mb-1">کدهای فعال و معتبر</div>
          <div className="text-2xl font-black text-emerald-600">{couponStats.active}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-purple-600 mb-1">مجموع دفعات استفاده</div>
          <div className="text-2xl font-black text-purple-600">{couponStats.totalUsed.toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">بار</span></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-blue-600 mb-1">مجموع سود اعطا شده به کاربران</div>
          <div className="text-xl font-black text-blue-600">{couponStats.totalDiscount.toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">تومان</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجوی کد تخفیف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] font-mono"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'همه' },
            { id: 'active', label: 'فعال' },
            { id: 'inactive', label: 'غیرفعال' },
            { id: 'expired', label: 'منقضی شده' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                statusFilter === item.id
                  ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
          <p className="text-sm text-gray-500 font-medium">در حال بارگذاری کدهای تخفیف...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-[var(--neo-border)]">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">هیچ کد تخفیفی یافت نشد</h3>
          <p className="text-sm text-gray-500 mt-1">با کلیک روی «کد تخفیف جدید» اولین کمپین خود را راه‌اندازی کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon: any) => {
            const isPercentage = coupon.type === 'percentage';
            const usagePercent = coupon.usageLimit ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100)) : null;

            return (
              <div 
                key={coupon._id}
                className={`bg-white rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between ${
                  !coupon.isActive || coupon.isExpired ? 'border-gray-200 opacity-80' : 'border-purple-200'
                }`}
              >
                <div>
                  {/* Top Bar: Code & Actions */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-black text-lg rounded-xl font-mono tracking-wider border border-purple-200 flex items-center gap-2">
                        {coupon.code}
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-purple-400 hover:text-purple-700 transition-colors"
                          title="کپی کد"
                        >
                          {copiedCode === coupon.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleMutation.mutate(coupon._id)}
                        disabled={toggleMutation.isPending}
                        className={`p-2 rounded-xl transition-colors ${
                          coupon.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={coupon.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="ویرایش کد"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف کد تخفیف «${coupon.code}» اطمینان دارید؟`)) {
                            deleteMutation.mutate(coupon._id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="حذف کد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {coupon.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                    {coupon.isExpired && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800">
                        منقضی شده
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800">
                      {isPercentage ? 'درصدی' : 'مبلغ ثابت'}
                    </span>
                  </div>

                  {/* Discount Value Highlight */}
                  <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] mb-4">
                    <div className="text-xs text-gray-500 mb-1">ارزش تخفیف</div>
                    <div className="text-2xl font-black text-purple-700">
                      {isPercentage ? `${coupon.value}٪` : `${coupon.value.toLocaleString('fa-IR')} تومان`}
                      {coupon.maxDiscount && (
                        <span className="text-xs font-normal text-gray-500 mr-2">
                          (سقف: {coupon.maxDiscount.toLocaleString('fa-IR')} تومان)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">حداقل خرید:</span>
                      <span className="font-bold">
                        {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString('fa-IR')} تومان` : 'بدون شرط'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">محدودیت هر کاربر:</span>
                      <span className="font-bold">{coupon.perUserLimit || 1} بار</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">تاریخ انقضا:</span>
                      <span className="font-bold">
                        {coupon.endAt ? new Date(coupon.endAt).toLocaleDateString('fa-IR') : 'نامحدود'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">مجموع تخفیف داده شده:</span>
                      <span className="font-bold text-emerald-600">
                        {(coupon.totalDiscountGiven || 0).toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage progress */}
                <div className="mt-5 pt-4 border-t border-[var(--neo-border)]">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-500">مصرف شده:</span>
                    <span>
                      {coupon.usageCount || 0} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'بار (نامحدود)'}
                    </span>
                  </div>
                  {usagePercent !== null && (
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${usagePercent >= 90 ? 'bg-rose-500' : 'bg-purple-600'}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--neo-border)] animate-in zoom-in-95">
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-black text-[var(--neo-text-main)]">
                {editingCoupon ? `ویرایش کد تخفیف ${editingCoupon.code}` : 'ایجاد کد تخفیف جدید'}
              </h3>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--neo-text-main)]">کد تخفیف (لاتین و بدون فاصله)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left tracking-wider text-base"
                  placeholder="e.g. NOROOZ1404"
                  dir="ltr"
                />
              </div>

              {/* Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">نوع تخفیف</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none bg-white"
                  >
                    <option value="percentage">درصدی (٪)</option>
                    <option value="fixed">مبلغ ثابت (تومان)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">
                    مقدار {formData.type === 'percentage' ? '(درصد)' : '(تومان)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left"
                    placeholder={formData.type === 'percentage' ? 'مثلاً ۲۰' : 'مثلاً ۵۰۰۰۰'}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">حداکثر سقف تخفیف (تومان)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left"
                    placeholder="اختیاری (برای درصدی)"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">حداقل مبلغ خرید (تومان)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left"
                    placeholder="اختیاری"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Usage caps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">سقف کل استفاده (نفر/بار)</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left"
                    placeholder="خالی = نامحدود"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">سقف استفاده هر کاربر</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">تاریخ شروع</label>
                  <input
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">تاریخ انقضا (اختیاری)</label>
                  <input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-[var(--neo-primary)] rounded cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                  کد تخفیف بلافاصله فعال باشد
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-[var(--neo-primary)] hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingCoupon ? 'ذخیره تغییرات' : 'ایجاد کد تخفیف')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
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
