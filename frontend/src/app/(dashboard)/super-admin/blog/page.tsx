'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi, Article, BlogCategory } from '@/features/blog/api/blog.api';
import { mediaApi } from '@/features/media/api/media.api';
import { 
  FileText, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, 
  Clock, Eye, Tag, FolderTree, AlertCircle, Loader2, Upload, 
  ExternalLink, Check, X, Filter
} from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/common/RichTextEditor';

export default function AdminBlogManagement() {
  const queryClient = useQueryClient();

  // Active Tab: 'articles' | 'categories'
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');

  // Search & Filter state for articles
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingArticle, setReviewingArticle] = useState<Article | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  // Article Form State
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    categoryId: '',
    tagsString: '',
    status: 'published' as 'draft' | 'pending_review' | 'published'
  });
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    order: 0
  });

  // Queries
  const { data: articlesData, isLoading: loadingArticles, isFetching: isFetchingArticles } = useQuery({
    queryKey: ['adminArticles', statusFilter, categoryFilter, search],
    queryFn: () => blogApi.getAdminArticles({ 
      status: statusFilter, 
      categoryId: categoryFilter || undefined,
      search: search || undefined
    }).then(res => res.data)
  });

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['blogCategoriesAdmin'],
    queryFn: () => blogApi.getCategories(true).then(res => res.data)
  });

  const articles = articlesData?.articles || [];
  const stats = articlesData?.stats || { total: 0, published: 0, pending: 0, draft: 0, rejected: 0 };
  const categories = categoriesData || [];

  // Mutations
  const createArticleMutation = useMutation({
    mutationFn: (data: any) => blogApi.createAdminArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      setArticleModalOpen(false);
      resetArticleForm();
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogApi.updateAdminArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      setArticleModalOpen(false);
      resetArticleForm();
    }
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => 
      blogApi.changeArticleStatus(id, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminArticles'] });
      setReviewModalOpen(false);
      setReviewingArticle(null);
      setRejectReason('');
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteArticle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminArticles'] })
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingCategory) {
        return blogApi.updateCategory(editingCategory._id, data);
      }
      return blogApi.createCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogCategoriesAdmin'] });
      setCategoryModalOpen(false);
      resetCategoryForm();
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blogCategoriesAdmin'] })
  });

  // Helpers
  const resetArticleForm = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      categoryId: '',
      tagsString: '',
      status: 'published'
    });
  };

  const openCreateArticle = () => {
    resetArticleForm();
    setArticleModalOpen(true);
  };

  const openEditArticle = (art: Article) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || '',
      content: art.content || '',
      thumbnail: art.thumbnail || '',
      categoryId: (art.categoryId as any)?._id || (art.categoryId as any) || '',
      tagsString: (art.tags || []).join(', '),
      status: art.status === 'rejected' ? 'draft' : art.status as any
    });
    setArticleModalOpen(true);
  };

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: articleForm.title,
      slug: articleForm.slug || undefined,
      excerpt: articleForm.excerpt,
      content: articleForm.content,
      thumbnail: articleForm.thumbnail,
      categoryId: articleForm.categoryId || undefined,
      tags: articleForm.tagsString.split(',').map(t => t.trim()).filter(Boolean),
      status: articleForm.status
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
      setArticleForm(prev => ({ ...prev, thumbnail: res.data.url }));
    } catch (e) {
      alert('خطا در آپلود تصویر');
    } finally {
      setUploadingThumb(false);
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      order: 0
    });
  };

  const openEditCategory = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      isActive: cat.isActive,
      order: cat.order || 0
    });
    setCategoryModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> منتشر شده</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"><Clock className="w-3.5 h-3.5" /> در انتظار تایید</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100"><XCircle className="w-3.5 h-3.5" /> رد شده</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700"><FileText className="w-3.5 h-3.5" /> پیش‌نویس</span>;
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
              <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت وبلاگ و نشریه</h1>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">مدیریت مقالات، دسته‌بندی‌ها، برچسب‌ها و تایید مقالات ارسالی اساتید</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { resetCategoryForm(); setCategoryModalOpen(true); }}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <FolderTree className="w-4 h-4" />
            دسته‌بندی جدید
          </button>
          <button
            onClick={openCreateArticle}
            className="px-5 py-2.5 bg-[var(--neo-primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            نوشتن مقاله جدید
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-gray-500 text-xs font-bold mb-1">کل مقالات</div>
          <div className="text-2xl font-black text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-emerald-600 text-xs font-bold mb-1">منتشر شده</div>
          <div className="text-2xl font-black text-emerald-600">{stats.published}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-amber-600 text-xs font-bold mb-1">در انتظار بررسی ادمین</div>
          <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-gray-600 text-xs font-bold mb-1">پیش‌نویس‌ها</div>
          <div className="text-2xl font-black text-gray-600">{stats.draft}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--neo-border)] gap-6">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'articles'
              ? 'border-[var(--neo-primary)] text-[var(--neo-primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          مقالات ({stats.total})
          {stats.pending > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
              {stats.pending} نیازمند تایید
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-[var(--neo-primary)] text-[var(--neo-primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          دسته‌بندی‌های موضوعی ({categories.length})
        </button>
      </div>

      {/* Tab: Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در عنوان یا متن..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pr-9 pl-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending_review">در انتظار بررسی</option>
                <option value="published">منتشر شده</option>
                <option value="draft">پیش‌نویس</option>
                <option value="rejected">رد شده</option>
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none"
              >
                <option value="">همه دسته‌ها</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-2xl border border-[var(--neo-border)] shadow-sm overflow-hidden relative">
            {isFetchingArticles && !loadingArticles && (
              <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600/10 backdrop-blur-xs py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 animate-pulse border-b border-blue-200">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                در حال بروزرسانی و دریافت لیست جدید مقالات...
              </div>
            )}

            {loadingArticles ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
                <Loader2 className="w-9 h-9 animate-spin text-[var(--neo-primary)] mb-3" />
                <span className="text-sm font-bold text-gray-700">در حال بارگذاری مقالات...</span>
                <span className="text-xs text-gray-400 mt-1">لطفاً شکیبا باشید</span>
              </div>
            ) : articles.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-600">مقاله‌ای با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold">
                      <th className="p-4">عنوان و مقاله</th>
                      <th className="p-4">نویسنده</th>
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
                            <div className="min-w-0 max-w-sm">
                              <Link 
                                href={`/blog/${art.slug}`} 
                                target="_blank"
                                className="font-bold text-gray-900 hover:text-[var(--neo-primary)] line-clamp-1 flex items-center gap-1.5"
                              >
                                {art.title}
                                <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                              </Link>
                              <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                                /{art.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-gray-800">
                            {art.authorId?.firstName} {art.authorId?.lastName}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {art.authorId?.email}
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
                            <div className="text-[10px] text-rose-500 mt-1 max-w-xs">
                              علت رد: {art.rejectionReason}
                            </div>
                          )}
                        </td>

                        <td className="p-4 font-mono font-bold text-gray-600">
                          {art.viewsCount || 0}
                        </td>

                        <td className="p-4 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {/* If pending review, show quick approve / reject buttons */}
                            {art.status === 'pending_review' && (
                              <button
                                onClick={() => { setReviewingArticle(art); setReviewModalOpen(true); }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                              >
                                بررسی و تعیین وضعیت
                              </button>
                            )}

                            {art.status === 'draft' && (
                              <button
                                onClick={() => changeStatusMutation.mutate({ id: art._id, status: 'published' })}
                                title="انتشار فوری"
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => openEditArticle(art)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                              title="ویرایش مقاله"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
                                  deleteArticleMutation.mutate(art._id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                              title="حذف مقاله"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-sm">دسته‌بندی‌های وبلاگ</h2>
              <button
                onClick={() => { resetCategoryForm(); setCategoryModalOpen(true); }}
                className="px-3 py-1.5 bg-[var(--neo-primary)] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن دسته‌بندی
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-bold bg-gray-50/70">
                    <th className="p-4">نام دسته‌بندی</th>
                    <th className="p-4">نامک (Slug)</th>
                    <th className="p-4">تعداد مقالات</th>
                    <th className="p-4">وضعیت</th>
                    <th className="p-4 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50/60">
                      <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                      <td className="p-4 font-mono text-gray-500">{cat.slug}</td>
                      <td className="p-4 font-bold text-blue-600">{cat.articlesCount || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {cat.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditCategory(cat)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
                                deleteCategoryMutation.mutate(cat._id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Approval Modal */}
      {reviewModalOpen && reviewingArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">بررسی مقاله استاد</h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-gray-800">{reviewingArticle.title}</div>
              <div className="text-xs text-gray-500">
                نویسنده: {reviewingArticle.authorId?.firstName} {reviewingArticle.authorId?.lastName}
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 max-h-40 overflow-y-auto">
                {reviewingArticle.excerpt || reviewingArticle.content.slice(0, 200)}...
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">علت رد (در صورت رد شدن مقاله):</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="توضیح دهید چرا مقاله رد شده یا چه اصلاحاتی نیاز دارد..."
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => changeStatusMutation.mutate({ 
                  id: reviewingArticle._id, 
                  status: 'rejected', 
                  rejectionReason: rejectReason || 'نیاز به ویرایش و اصلاح محتوا' 
                })}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                رد مقاله
              </button>
              <button
                type="button"
                onClick={() => changeStatusMutation.mutate({ id: reviewingArticle._id, status: 'published' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                تایید و انتشار رسمی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Create/Edit Modal */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingArticle ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}
              </h2>
              <button onClick={() => setArticleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleArticleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">عنوان مقاله *</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                    placeholder="مثال: نقشه راه یادگیری هوش مصنوعی در ۲۰۲۶"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نامک (Slug URL)</label>
                  <input
                    type="text"
                    value={articleForm.slug}
                    onChange={e => setArticleForm(p => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                    placeholder="ai-learning-roadmap-2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">دسته‌بندی</label>
                  <select
                    value={articleForm.categoryId}
                    onChange={e => setArticleForm(p => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">وضعیت انتشار</label>
                  <select
                    value={articleForm.status}
                    onChange={e => setArticleForm(p => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                  >
                    <option value="published">منتشر شود (Published)</option>
                    <option value="draft">پیش‌نویس (Draft)</option>
                    <option value="pending_review">در انتظار بررسی</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تصویر شاخص مقاله</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={articleForm.thumbnail}
                    onChange={e => setArticleForm(p => ({ ...p, thumbnail: e.target.value }))}
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
                  value={articleForm.excerpt}
                  onChange={e => setArticleForm(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="خلاصه‌ای جذاب برای نمایش در کارت مقاله و سئو..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">متن کامل مقاله (ویرایشگر پیشرفته / پشتیبانی از HTML و استایل) *</label>
                <RichTextEditor
                  value={articleForm.content}
                  onChange={(val) => setArticleForm(p => ({ ...p, content: val }))}
                  placeholder="محتوای غنی و کامل مقاله را با استایل، تیترها و تصاویر اینجا بنویسید..."
                  minHeight="280px"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={articleForm.tagsString}
                  onChange={e => setArticleForm(p => ({ ...p, tagsString: e.target.value }))}
                  placeholder="برنامه‌نویسی, پایتون, هوش مصنوعی"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setArticleModalOpen(false)}
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
                  {editingArticle ? 'ذخیره تغییرات' : 'انتشار مقاله'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-bold text-gray-900">
                {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
              </h2>
              <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                saveCategoryMutation.mutate(catForm);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نام دسته‌بندی *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: یادگیری ماشین"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نامک (Slug) *</label>
                <input
                  type="text"
                  required
                  value={catForm.slug}
                  onChange={e => setCatForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="machine-learning"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs dir-ltr text-left focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">توضیحات</label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="توضیح کوتاه درباره این دسته..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={catForm.isActive}
                  onChange={e => setCatForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="rounded text-[var(--neo-primary)]"
                />
                <label htmlFor="catActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  دسته‌بندی فعال و قابل انتخاب باشد
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saveCategoryMutation.isPending}
                  className="px-5 py-2 bg-[var(--neo-primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {saveCategoryMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
