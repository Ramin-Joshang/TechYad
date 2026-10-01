'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';
import { 
  HelpCircle, Plus, Edit3, Trash2, Search, Filter, 
  CheckCircle2, Loader2, Sparkles, ChevronDown, ChevronUp, 
  Layers, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toEnDigits } from '@/lib/utils';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'همه دسته‌ها' },
  { id: 'register', label: 'ثبت‌نام و عضویت' },
  { id: 'courses', label: 'دوره‌های آموزشی' },
  { id: 'payment', label: 'پرداخت و امور مالی' },
  { id: 'online', label: 'کلاس‌های آنلاین' },
  { id: 'offline', label: 'کلاس‌های حضوری' },
  { id: 'support', label: 'پشتیبانی و ارتباط' }
];

export default function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any | null>(null);

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'courses',
    isActive: true,
    order: 0
  });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['adminFaqs'],
    queryFn: () => generalApi.getAllFaqsAdmin().then(res => res.data)
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingFaq) {
        return generalApi.updateFaq(editingFaq._id, data);
      }
      return generalApi.createFaq(data);
    },
    onSuccess: () => {
      toast.success(editingFaq ? 'سوال با موفقیت ویرایش شد' : 'سوال متداول جدید با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsModalOpen(false);
      setEditingFaq(null);
    },
    onError: () => toast.error('خطا در ذخیره سوال متداول')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => generalApi.deleteFaq(id),
    onSuccess: () => {
      toast.success('سوال متداول با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminFaqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
    onError: () => toast.error('خطا در حذف سوال')
  });

  const handleOpenModal = (faq?: any) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'courses',
        isActive: faq.isActive !== false,
        order: faq.order || 0
      });
    } else {
      setEditingFaq(null);
      setFaqForm({
        question: '',
        answer: '',
        category: 'courses',
        isActive: true,
        order: faqs.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('لطفاً پرسش و پاسخ را وارد کنید');
      return;
    }
    saveMutation.mutate(faqForm);
  };

  const filteredFaqs = (faqs || []).filter((f: any) => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesSearch = !searchTerm || 
      f.question?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
              مدیریت سوالات متداول (FAQ)
            </h1>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
              مدیریت، افزودن، اولویت‌بندی و دسته‌بندی پرسش و پاسخ‌های صفحه عمومی /faq
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          افزودن پرسش جدید
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-[var(--neo-border)]">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در پرسش‌ها و پاسخ‌ها..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
          >
            {FAQ_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQ Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
          <span className="text-xs text-gray-500 font-bold">در حال دریافت سوالات...</span>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-600">سوالی یافت نشد</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-3 px-4 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl"
          >
            ایجاد اولین سوال متداول
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq: any, idx: number) => {
            const catObj = FAQ_CATEGORIES.find(c => c.id === faq.category) || { label: faq.category };
            return (
              <div 
                key={faq._id || idx}
                className="p-5 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                        {catObj.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        faq.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {faq.isActive ? 'منتشر شده' : 'پیش‌نویس / غیرفعال'}
                      </span>
                      {faq.order !== undefined && (
                        <span className="text-[10px] text-gray-400 font-mono">
                          ترتیب: {faq.order}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm text-[var(--neo-text-main)]">
                      {faq.question}
                    </h3>

                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenModal(faq)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      title="ویرایش سوال"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('آیا از حذف این پرسش متداول اطمینان دارید؟')) {
                          deleteMutation.mutate(faq._id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="حذف سوال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neo-border)]">
              <h3 className="text-base font-black text-gray-900">
                {editingFaq ? 'ویرایش پرسش متداول' : 'افزودن پرسش متداول جدید'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">دسته‌بندی پرسش</label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
                >
                  <option value="courses">دوره‌های آموزشی</option>
                  <option value="register">ثبت‌نام و عضویت</option>
                  <option value="payment">پرداخت و امور مالی</option>
                  <option value="online">کلاس‌های آنلاین</option>
                  <option value="offline">کلاس‌های حضوری</option>
                  <option value="support">پشتیبانی و ارتباط</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">صورت سوال (پرسش) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: آیا پس از اتمام دوره امکان دسترسی به ویدیوها وجود دارد؟"
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">پاسخ کامل سوال *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="پاسخ کامل و راهنمایی شفاف برای دانشجو بنویسید..."
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ترتیب نمایش (عددی)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={faqForm.order}
                    onChange={e => {
                      const clean = toEnDigits(e.target.value).replace(/[^0-9]/g, '');
                      setFaqForm({ ...faqForm, order: clean ? Number(clean) : 0 });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="faqActive"
                    checked={faqForm.isActive}
                    onChange={e => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--neo-primary)]"
                  />
                  <label htmlFor="faqActive" className="text-xs font-bold text-gray-700">
                    فعال و نمایش در سایت
                  </label>
                </div>
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
                  ذخیره پرسش متداول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
