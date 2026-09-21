'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi, Article, BlogCategory } from '@/features/blog/api/blog.api';
import { mediaApi } from '@/features/media/api/media.api';
import { 
  FileText, Plus, Edit3, CheckCircle2, XCircle, 
  Clock, Tag, FolderTree, AlertCircle, Loader2, Upload, 
  ExternalLink, X, Send
} from 'lucide-react';
import Link from 'next/link';

export default function InstructorBlogPage() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    categoryId: '',
    tagsString: '',
    submitForReview: true
  });
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Queries
  const { data: articlesData, isLoading: loadingArticles } = useQuery({
    queryKey: ['instructorArticles'],
    queryFn: () => blogApi.getInstructorArticles().then(res => res.data)
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['blogCategoriesInstructor'],
    queryFn: () => blogApi.getCategories(true).then(res => res.data)
  });

  const articles = articlesData?.articles || [];
  const stats = articlesData?.stats || { total: 0, published: 0, pending: 0, draft: 0, rejected: 0 };
  const categories = categoriesData || [];

  // Mutations
  const createArticleMutation = useMutation({
    mutationFn: (data: any) => blogApi.createInstructorArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorArticles'] });
      setModalOpen(false);
      resetForm();
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.updateInstructorArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorArticles'] });
      setModalOpen(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      categoryId: '',
      tagsString: '',
      submitForReview: true
    });
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (art: Article) => {
    setEditingArticle(art);
    setForm({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || '',
      content: art.content || '',
      thumbnail: art.thumbnail || '',
      categoryId: (art.categoryId as any)?._id || (art.categoryId as any) || '',
      tagsString: (art.tags || []).join(', '),
      submitForReview: art.status === 'pending_review'
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      content: form.content,
      thumbnail: form.thumbnail,
      categoryId: form.categoryId || undefined,
      tags: form.tagsString.split(',').map(t => t.trim()).filter(Boolean),
      submitForReview: form.submitForReview
    };

    if (editingArticle) {
      updateArticleMutation.mutate({ id: editingArticle._id, data: payload });
    } else {
      createArticleMutation.mutate(payload);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingThumb(true);
      const res = await mediaApi.uploadFile(file);
      setForm(prev => ({ ...prev, thumbnail: res.data.url }));
    } catch (e) {
      alert('خطا در آپلود تصویر');
    } finally {
      setUploadingThumb(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> تایید و منتشر شده</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"><Clock className="w-3.5 h-3.5" /> در انتظار تایید مدیریت</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100"><XCircle className="w-3.5 h-3.5" /> نیازمند اصلاح</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700"><FileText className="w-3.5 h-3.5" /> پیش‌نویس شخصی</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--neo-surface)] border border-[var(--neo-border)] p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مقالات من در وبلاگ تک‌یاد</h1>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">
                تولید محتوای تخصصی و اشتراک دانش — مقالات شما پس از بررسی توسط تیم تحریریه و ادمین منتشر خواهد شد.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-[var(--neo-primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          نگارش مقاله جدید
        </button>
      </div>

      {/* Guide Card */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-800">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">راهنمای انتشار مقالات اساتید:</span> شما می‌توانید مقالات خود را به صورت «پیش‌نویس» ذخیره کرده یا جهت تایید به «تیم ادمین» ارسال فرمایید. پس از بررسی و تایید، مقاله مستقیماً در وبلاگ عمومی سایت با نام و پروفایل شما قرار خواهد گرفت.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-gray-500 text-xs font-bold mb-1">کل مقالات من</div>
          <div className="text-2xl font-black text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-emerald-600 text-xs font-bold mb-1">تایید و منتشر شده</div>
          <div className="text-2xl font-black text-emerald-600">{stats.published}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-amber-600 text-xs font-bold mb-1">در صف بررسی ادمین</div>
          <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-rose-600 text-xs font-bold mb-1">نیازمند اصلاح</div>
          <div className="text-2xl font-black text-rose-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-2xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {loadingArticles ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
            <span className="text-xs">در حال بارگذاری مقالات...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-600">هنوز مقاله‌ای ایجاد نکرده‌اید.</p>
            <button
              onClick={openCreate}
              className="mt-3 px-4 py-2 bg-[var(--neo-primary)] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              نوشتن اولین مقاله
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold">
                  <th className="p-4">عنوان مقاله</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">بازدید</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((art) => (
                  <tr key={art._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {art.thumbnail ? (
                          <img src={art.thumbnail} alt={art.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-md">
                          <div className="font-bold text-gray-900 line-clamp-1">{art.title}</div>
                          {art.status === 'published' && (
                            <Link 
                              href={`/blog/${art.slug}`} 
                              target="_blank"
                              className="text-[11px] text-[var(--neo-primary)] hover:underline mt-0.5 inline-flex items-center gap-1"
                            >
                              مشاهده در سایت
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {art.categoryId ? (
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 font-medium">
                          {art.categoryId.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(art.status)}
                      {art.status === 'rejected' && art.rejectionReason && (
                        <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg mt-1.5 max-w-sm">
                          <span className="font-bold">یادداشت مدیریت: </span>
                          {art.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-gray-600">
                      {art.viewsCount || 0}
                    </td>

                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(art)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          ویرایش
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingArticle ? 'ویرایش مقاله' : 'نگارش مقاله جدید'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عنوان مقاله *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                    placeholder="مثال: ۵ تکنیک برتر در یادگیری عمیق"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نامک (Slug URL اختیاری)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                    placeholder="deep-learning-techniques"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">دسته‌بندی موضوعی</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تصویر شاخص مقاله</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))}
                    placeholder="آدرس تصویر یا آپلود مستقیم"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs dir-ltr text-left"
                  />
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                    {uploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    آپلود
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  </label>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">چکیده / خلاصه مقاله *</label>
                <textarea
                  required
                  rows={2}
                  value={form.excerpt}
                  onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="خلاصه‌ای کاربردی از آنچه دانشجو در این مقاله می‌آموزد..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">متن اصلی مقاله *</label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="محتوای تخصصی مقاله شما..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)] font-mono"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={form.tagsString}
                  onChange={e => setForm(p => ({ ...p, tagsString: e.target.value }))}
                  placeholder="هوش مصنوعی, پردازش تصویر, پایتون"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              {/* Status choice for instructor */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="submitReview"
                    name="statusChoice"
                    checked={form.submitForReview}
                    onChange={() => setForm(p => ({ ...p, submitForReview: true }))}
                    className="text-[var(--neo-primary)]"
                  />
                  <label htmlFor="submitReview" className="text-xs font-bold text-gray-800 cursor-pointer">
                    ارسال جهت بررسی و تایید توسط تیم ادمین (وضعیت: pending_review)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="saveDraft"
                    name="statusChoice"
                    checked={!form.submitForReview}
                    onChange={() => setForm(p => ({ ...p, submitForReview: false }))}
                    className="text-[var(--neo-primary)]"
                  />
                  <label htmlFor="saveDraft" className="text-xs font-bold text-gray-800 cursor-pointer">
                    فقط ذخیره به صورت پیش‌نویس شخصی (وضعیت: draft)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createArticleMutation.isPending || updateArticleMutation.isPending}
                  className="px-6 py-2.5 bg-[var(--neo-primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {(createArticleMutation.isPending || updateArticleMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {form.submitForReview ? 'ارسال جهت بررسی' : 'ذخیره پیش‌نویس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
