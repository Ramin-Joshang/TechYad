'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { api } from '@/lib/api';
import { 
  Loader2, Search, BookOpen, CheckCircle, XCircle, Plus, Edit, 
  Trash2, ExternalLink, Layers, Eye, Users, DollarSign, Filter,
  Clock, CheckCircle2, AlertTriangle, X, Save
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUploader } from '@/components/common/MediaUploader';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingCourseId, setUpdatingCourseId] = useState<string | null>(null);
  
  // Modals state
  const [detailCourse, setDetailCourse] = useState<any | null>(null);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New course form
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    price: 0,
    shortDescription: '',
    description: '',
    thumbnail: '',
    status: 'published'
  });

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => adminApi.getCourses().then(res => res.data)
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data || [])
  });

  const courses = coursesData?.courses || [];

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      setUpdatingCourseId(id);
      return adminApi.updateCourse(id, { status });
    },
    onSuccess: () => {
      toast.success('وضعیت دوره با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت دوره');
    },
    onSettled: () => setUpdatingCourseId(null)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      setUpdatingCourseId(id);
      return adminApi.deleteCourse(id);
    },
    onSuccess: () => {
      toast.success('دوره با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      if (detailCourse?._id === updatingCourseId) setDetailCourse(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف دوره');
    },
    onSettled: () => setUpdatingCourseId(null)
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateCourse(id, data),
    onSuccess: () => {
      toast.success('دوره با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setEditingCourse(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش دوره');
    }
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: any) => adminApi.createCourse(data),
    onSuccess: () => {
      toast.success('دوره جدید با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setShowCreateModal(false);
      setNewCourseData({
        title: '',
        slug: '',
        categoryId: '',
        price: 0,
        shortDescription: '',
        description: '',
        thumbnail: '',
        status: 'published'
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد دوره');
    }
  });

  // Filters
  const filteredCourses = courses.filter((c: any) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || 
                        c.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchCat = categoryFilter === 'all' || 
                     c.categoryId?._id === categoryFilter || 
                     c.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  // Statistics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c: any) => c.status === 'published').length;
  const pendingCourses = courses.filter((c: any) => c.status === 'pending' || c.status === 'pending_review').length;
  const freeCourses = courses.filter((c: any) => !c.price || c.price === 0).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت جامع دوره‌های آموزشی</h1>
          <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشاهده، تایید، ویرایش سرفصل‌ها، تغییر وضعیت و دسترسی سریع به لینک‌ها</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            id="admin-create-course-quick-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--neo-primary)] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            افزودن دوره جدید
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کل دوره‌ها</span>
            <h4 className="text-xl font-black text-[var(--neo-text-main)]">{totalCourses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">منتشر شده</span>
            <h4 className="text-xl font-black text-emerald-600">{publishedCourses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">در انتظار بررسی</span>
            <h4 className="text-xl font-black text-amber-600">{pendingCourses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">دوره‌های رایگان</span>
            <h4 className="text-xl font-black text-[var(--neo-text-main)]">{freeCourses}</h4>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو در عنوان یا نامک دوره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-9 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="draft">پیش‌نویس</option>
            <option value="rejected">رد شده</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {categories?.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name || c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 text-center text-[var(--neo-text-secondary)] font-medium">
            دوره‌ای با مشخصات انتخابی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60 text-[var(--neo-text-secondary)] font-bold">
                  <th className="p-4">پوستر و عنوان دوره</th>
                  <th className="p-4">مدرس(ها)</th>
                  <th className="p-4">دسته‌بندی</th>
                  <th className="p-4">قیمت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-center">لینک‌های سریع و عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredCourses.map((course: any) => {
                  const isUpdating = updatingCourseId === course._id;
                  const instructor = course.instructors?.[0];
                  const instructorName = instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email : 'مشخص نشده';

                  return (
                    <tr key={course._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                      {/* Title & Poster */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail || `https://picsum.photos/seed/${course._id}/120/70`}
                            alt={course.title}
                            className="w-14 h-10 object-cover rounded-lg border border-[var(--neo-border)] shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/120/70'; }}
                          />
                          <div>
                            <span className="font-bold text-[var(--neo-text-main)] block max-w-xs truncate" title={course.title}>
                              {course.title}
                            </span>
                            <span className="text-[10px] text-[var(--neo-text-muted)] dir-ltr block text-right">
                              /{course.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="p-4 font-medium text-[var(--neo-text-secondary)]">
                        {instructorName}
                      </td>

                      {/* Category */}
                      <td className="p-4 text-[var(--neo-text-secondary)]">
                        <span className="px-2 py-0.5 bg-[var(--neo-surface-2)] rounded-md border border-[var(--neo-border)] text-[10px] font-bold">
                          {course.categoryId?.name || course.categoryId?.title || 'عمومی'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-black">
                        {!course.price || course.price === 0 ? (
                          <span className="text-emerald-600 font-bold">رایگان</span>
                        ) : (
                          <span className="text-[var(--neo-text-main)]">{Number(course.price).toLocaleString()} تومان</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--neo-primary)]" />}
                          <select
                            value={course.status || 'draft'}
                            disabled={isUpdating}
                            onChange={(e) => updateStatusMutation.mutate({ id: course._id, status: e.target.value })}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black outline-none border cursor-pointer ${
                              course.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              course.status === 'pending' || course.status === 'pending_review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              course.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] border-[var(--neo-border)]'
                            }`}
                          >
                            <option value="published">منتشر شده</option>
                            <option value="pending">در انتظار بررسی</option>
                            <option value="draft">پیش‌نویس</option>
                            <option value="rejected">رد شده</option>
                          </select>
                        </div>
                      </td>

                      {/* Quick Action Links */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Public View Link */}
                          <Link
                            href={`/courses/${course.slug || course._id}`}
                            target="_blank"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="مشاهده صفحه دوره در سایت"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Curriculum / Lessons Editor Link */}
                          <Link
                            href={`/instructor/courses/${course._id}/edit`}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="مدیریت سرفصل‌ها و دروس"
                          >
                            <Layers className="w-4 h-4" />
                          </Link>

                          {/* Details Modal */}
                          <button
                            onClick={() => setDetailCourse(course)}
                            className="p-1.5 text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] rounded-lg transition"
                            title="مشاهده جزئیات کامل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => setEditingCourse(course)}
                            className="p-1.5 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition"
                            title="ویرایش مشخصات"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف دوره "${course.title}" اطمینان کامل دارید؟`)) {
                                deleteMutation.mutate(course._id);
                              }
                            }}
                            disabled={isUpdating}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                            title="حذف دوره"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {detailCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--neo-border)]">
              <h3 className="font-black text-base text-[var(--neo-text-main)]">گزارش و جزئیات جامع دوره</h3>
              <button onClick={() => setDetailCourse(null)} className="p-1.5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video relative rounded-2xl overflow-hidden bg-black/10 border border-[var(--neo-border)]">
              <img src={detailCourse.thumbnail || `https://picsum.photos/seed/${detailCourse._id}/600/300`} alt={detailCourse.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-[var(--neo-surface)]/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-black shadow-sm">
                {detailCourse.status === 'published' ? 'منتشر شده' : detailCourse.status}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black text-[var(--neo-text-main)]">{detailCourse.title}</h2>
              <p className="text-xs text-[var(--neo-text-muted)] mt-0.5 dir-ltr text-right">/{detailCourse.slug}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[10px] text-[var(--neo-text-secondary)] block">هزینه دوره</span>
                <span className="font-black text-xs text-[var(--neo-text-main)]">
                  {detailCourse.price ? `${detailCourse.price.toLocaleString()} تومان` : 'رایگان'}
                </span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[10px] text-[var(--neo-text-secondary)] block">دسته‌بندی</span>
                <span className="font-black text-xs text-[var(--neo-text-main)]">
                  {detailCourse.categoryId?.name || detailCourse.categoryId?.title || 'عمومی'}
                </span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[10px] text-[var(--neo-text-secondary)] block">تعداد دانشجویان</span>
                <span className="font-black text-xs text-[var(--neo-text-main)]">
                  {detailCourse.enrolledStudentsCount || 0} دانشجو
                </span>
              </div>
            </div>

            {detailCourse.shortDescription && (
              <div>
                <h4 className="text-xs font-bold text-[var(--neo-text-main)] mb-1">خلاصه کوتاه</h4>
                <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed bg-[var(--neo-surface-2)] p-3 rounded-xl">
                  {detailCourse.shortDescription}
                </p>
              </div>
            )}

            {detailCourse.description && (
              <div>
                <h4 className="text-xs font-bold text-[var(--neo-text-main)] mb-1">توضیحات کامل</h4>
                <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed bg-[var(--neo-surface-2)] p-3 rounded-xl max-h-36 overflow-y-auto">
                  {detailCourse.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--neo-border)]">
              <Link
                href={`/courses/${detailCourse.slug || detailCourse._id}`}
                target="_blank"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-4 h-4" /> مشاهده صفحه عمومی دوره
              </Link>
              <Link
                href={`/instructor/courses/${detailCourse._id}/edit`}
                className="flex-1 py-2 bg-[var(--neo-primary)] text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 transition hover:opacity-90"
              >
                <Layers className="w-4 h-4" /> ویرایش سرفصل‌ها و جلسات
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--neo-border)]">
              <h3 className="font-black text-base text-[var(--neo-text-main)]">ویرایش مشخصات دوره</h3>
              <button onClick={() => setEditingCourse(null)} className="p-1.5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCourseMutation.mutate({
                  id: editingCourse._id,
                  data: {
                    title: editingCourse.title,
                    slug: editingCourse.slug,
                    price: Number(editingCourse.price) || 0,
                    status: editingCourse.status,
                    thumbnail: editingCourse.thumbnail,
                    previewVideo: editingCourse.previewVideo,
                    shortDescription: editingCourse.shortDescription,
                    categoryId: editingCourse.categoryId?._id || editingCourse.categoryId
                  }
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">عنوان دوره *</label>
                  <input
                    required
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">نامک یکتا (Slug) *</label>
                  <input
                    required
                    value={editingCourse.slug || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, slug: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">قیمت (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCourse.price || 0}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">وضعیت</label>
                  <select
                    value={editingCourse.status || 'draft'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="published">منتشر شده</option>
                    <option value="pending">در انتظار بررسی</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="rejected">رد شده</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">توضیح کوتاه</label>
                <textarea
                  rows={2}
                  value={editingCourse.shortDescription || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none resize-none"
                />
              </div>

              <div>
                <MediaUploader
                  label="تصویر پوستر دوره (آپلود یا لینک)"
                  value={editingCourse.thumbnail}
                  onChange={(url) => setEditingCourse({ ...editingCourse, thumbnail: url })}
                  accept="image/*"
                  previewType="image"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--neo-border)]">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs font-bold text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                  className="px-6 py-2 text-xs font-bold text-white bg-[var(--neo-primary)] rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {updateCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  ذخیره تغییرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Quick Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--neo-border)]">
              <h3 className="font-black text-base text-[var(--neo-text-main)]">ایجاد دوره جدید توسط ادمین</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCourseData.title || !newCourseData.slug || !newCourseData.categoryId) {
                  toast.error('لطفاً عنوان، نامک و دسته‌بندی را مشخص کنید');
                  return;
                }
                createCourseMutation.mutate(newCourseData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">عنوان دوره *</label>
                  <input
                    required
                    value={newCourseData.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setNewCourseData(prev => ({
                        ...prev,
                        title: t,
                        slug: prev.slug ? prev.slug : t.toLowerCase().trim().replace(/[\s\W-]+/g, '-')
                      }));
                    }}
                    placeholder="مثال: آموزش معماری میکروسرویس"
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">نامک یکتا (Slug) *</label>
                  <input
                    required
                    value={newCourseData.slug}
                    onChange={(e) => setNewCourseData({ ...newCourseData, slug: e.target.value })}
                    placeholder="microservices-architecture"
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">دسته‌بندی *</label>
                  <select
                    required
                    value={newCourseData.categoryId}
                    onChange={(e) => setNewCourseData({ ...newCourseData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories?.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name || c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">قیمت (تومان)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCourseData.price}
                    onChange={(e) => setNewCourseData({ ...newCourseData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">توضیح کوتاه</label>
                <textarea
                  rows={2}
                  value={newCourseData.shortDescription}
                  onChange={(e) => setNewCourseData({ ...newCourseData, shortDescription: e.target.value })}
                  placeholder="خلاصه دوره..."
                  className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none resize-none"
                />
              </div>

              <div>
                <MediaUploader
                  label="پوستر دوره"
                  value={newCourseData.thumbnail}
                  onChange={(url) => setNewCourseData({ ...newCourseData, thumbnail: url })}
                  accept="image/*"
                  previewType="image"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--neo-border)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="px-6 py-2 text-xs font-bold text-white bg-[var(--neo-primary)] rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {createCourseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  ایجاد دوره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
