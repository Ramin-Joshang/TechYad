'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';
import { MediaUploader } from '@/components/common/MediaUploader';
import { 
  Quote, Star, Plus, Edit3, Trash2, CheckCircle2, 
  Loader2, User, BookOpen, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toEnDigits } from '@/lib/utils';

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [form, setForm] = useState({
    studentName: '',
    courseName: '',
    avatar: '',
    content: '',
    rating: 5,
    isActive: true,
    order: 0
  });

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: () => generalApi.getAllTestimonialsAdmin().then(res => res.data)
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingItem) {
        return generalApi.updateTestimonial(editingItem._id, data);
      }
      return generalApi.createTestimonial(data);
    },
    onSuccess: () => {
      toast.success(editingItem ? 'نظر دانشجو با موفقیت ویرایش شد' : 'نظر جدید با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: () => toast.error('خطا در ذخیره نظر')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => generalApi.deleteTestimonial(id),
    onSuccess: () => {
      toast.success('نظر با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
    },
    onError: () => toast.error('خطا در حذف نظر')
  });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        studentName: item.studentName || item.user?.firstName || '',
        courseName: item.courseName || '',
        avatar: item.avatar || '',
        content: item.content || item.comment || '',
        rating: item.rating || 5,
        isActive: item.isActive !== false,
        order: item.order || 0
      });
    } else {
      setEditingItem(null);
      setForm({
        studentName: '',
        courseName: '',
        avatar: '',
        content: '',
        rating: 5,
        isActive: true,
        order: testimonials.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim() || !form.content.trim()) {
      toast.error('نام دانشجو و متن نظر الزامی است');
      return;
    }
    saveMutation.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Quote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
              مدیریت داستان‌های موفقیت و نظرات صفحه اصلی
            </h1>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
              مدیریت کارت‌های نظرات دانشجویان برجسته که در لندینگ پیج و صفحه اصلی نمایش داده می‌شوند
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          افزودن نظر جدید
        </button>
      </div>

      {/* Grid of Testimonials */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
          <span className="text-xs text-gray-500 font-bold">در حال دریافت نظرات...</span>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600">هنوز نظری ثبت نشده است</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-3 px-4 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl"
          >
            ایجاد اولین نظر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item: any) => (
            <div 
              key={item._id}
              className="p-6 bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs relative flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                          {item.studentName?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--neo-text-main)]">{item.studentName}</h3>
                      <p className="text-xs text-gray-500">{item.courseName || 'دانشجوی تک‌یاد'}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.isActive !== false ? 'فعال' : 'غیرفعال'}
                  </span>
                </div>

                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < (item.rating || 5) ? 'fill-current' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic mb-6">
                  "{item.content}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  ترتیب: {item.order || 0}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="ویرایش"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`آیا نظر مربوط به «${item.studentName}» حذف شود؟`)) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neo-border)]">
              <h3 className="text-base font-black text-gray-900">
                {editingItem ? 'ویرایش نظر دانشجو' : 'افزودن نظر و داستان موفقیت جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام دانشجو *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارا محمدی"
                    value={form.studentName}
                    onChange={e => setForm({ ...form, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام دوره یا سمت دانشجو</label>
                  <input
                    type="text"
                    placeholder="مثال: دانشجوی دوره جامع فرانت‌اند"
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تصویر یا آواتار دانشجو</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    placeholder="https://... یا آپلود تصویر"
                    value={form.avatar}
                    onChange={e => setForm({ ...form, avatar: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs dir-ltr font-mono"
                  />
                  <MediaUploader
                    onUploadSuccess={(url) => setForm(prev => ({ ...prev, avatar: url }))}
                    category="image"
                    label="آپلود"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">متن نظر و تجربه آموزشی *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="تجربه یادگیری دانشجو و میزان رضایت از دوره و مدرس..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">امتیاز (۱ تا ۵ ستاره)</label>
                  <select
                    value={form.rating}
                    onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
                  >
                    <option value={5}>۵ ستاره (عالی)</option>
                    <option value={4}>۴ ستاره (بسیار خوب)</option>
                    <option value={3}>۳ ستاره (متوسط)</option>
                    <option value={2}>۲ ستاره</option>
                    <option value={1}>۱ ستاره</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ترتیب نمایش</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.order}
                    onChange={e => {
                      const clean = toEnDigits(e.target.value).replace(/[^0-9]/g, '');
                      setForm({ ...form, order: clean ? Number(clean) : 0 });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="testActive"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--neo-primary)]"
                />
                <label htmlFor="testActive" className="text-xs font-bold text-gray-700">
                  نمایش در صفحه اصلی سایت
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--neo-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ذخیره نظر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
