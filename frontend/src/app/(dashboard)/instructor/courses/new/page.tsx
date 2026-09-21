'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/features/courses/api/courses.api';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, ArrowRight, BookOpen, Layers } from 'lucide-react';
import Link from 'next/link';
import { MediaUploader } from '@/components/common/MediaUploader';
import toast from 'react-hot-toast';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    thumbnail: '',
    previewVideo: '',
    price: 0
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data || [])
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.categoryId) {
      toast.error('لطفاً فیلدهای اجباری را پر کنید');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0
      };
      
      const response: any = await coursesApi.createCourse(payload);
      const newCourseId = response?.data?._id || response?._id;
      toast.success('دوره با موفقیت ایجاد شد');
      if (newCourseId) {
        router.push(`/instructor/courses/${newCourseId}/edit`);
      } else {
        router.push('/instructor/courses');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ایجاد دوره');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Link href="/instructor/courses" className="p-2.5 bg-[var(--neo-surface)] rounded-2xl border border-[var(--neo-border)] shadow-sm hover:bg-[var(--neo-surface-2)] transition-colors">
          <ArrowRight className="w-5 h-5 text-[var(--neo-text-secondary)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">ایجاد دوره جدید</h1>
          <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشخصات اولیه، تصویر شاخص و دسته‌بندی دوره را مشخص کنید</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
          <h2 className="text-base font-black text-[var(--neo-text-main)]">اطلاعات اولیه دوره</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">عنوان دوره *</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium"
                placeholder="مثال: آموزش پیشرفته ری‌اکت و نکست"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">شناسه یکتا (Slug) *</label>
              <input 
                type="text" 
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium text-left dir-ltr"
                placeholder="react-nextjs-complete-course"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">دسته‌بندی *</label>
              <select 
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories?.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name || cat.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">هزینه دوره (تومان) *</label>
              <input 
                type="number" 
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium text-left dir-ltr"
                placeholder="0 برای رایگان"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">خلاصه کوتاه دوره</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium resize-none"
              placeholder="توضیح کوتاه درباره آنچه در این دوره آموزش داده می‌شود..."
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
          <div>
            <h2 className="text-base font-black text-[var(--neo-text-main)]">تصویر پوستر و ویدیوی پیش‌نمایش</h2>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">تصویر شاخص دوره را بارگذاری کنید یا بعداً در صفحه ویرایش تکمیل کنید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MediaUploader
              id="new-course-thumbnail"
              label="تصویر شاخص (پوستر)"
              value={formData.thumbnail}
              onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
              accept="image/*"
              previewType="image"
            />

            <MediaUploader
              id="new-course-preview"
              label="ویدیوی تیزر یا معرفی رایگان"
              value={formData.previewVideo}
              onChange={(url) => setFormData(prev => ({ ...prev, previewVideo: url }))}
              accept="video/*"
              previewType="video"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-[var(--neo-primary)] hover:opacity-95 text-white font-bold rounded-2xl shadow-lg transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ایجاد دوره و رفتن به سرفصل‌ها'}
          </button>
        </div>
      </form>
    </div>
  );
}
