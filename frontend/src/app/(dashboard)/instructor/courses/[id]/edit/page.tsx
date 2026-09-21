'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowRight, Loader2, Save, Send, AlertCircle, 
  CheckCircle2, ExternalLink, Users, BookOpen, Layers
} from 'lucide-react';
import { CurriculumBuilder } from './CurriculumBuilder';
import { MediaUploader } from '@/components/common/MediaUploader';
import toast from 'react-hot-toast';

export default function EditCoursePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
  const [loading, setLoading] = useState(false);
  
  const isAdminUser = user?.role === 'admin' || user?.role === 'super-admin';

  // Data Fetching
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (isAdminUser) {
        const res = await adminApi.getCourseById(courseId);
        return res.data?.data || res.data;
      }
      const res = await api.get(`/instructor/courses/${courseId}`);
      return res.data?.data || res.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(res => res.data || [])
  });

  // State for Basic Info
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: 0,
    thumbnail: '',
    previewVideo: '',
    categoryId: '',
    levelId: '',
    status: 'draft',
    rejectionReason: '',
    prerequisites: [] as string[],
    targetAudience: [] as string[]
  });

  const [prereqInput, setPrereqInput] = useState('');

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        slug: course.slug || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        price: course.price || 0,
        thumbnail: course.thumbnail || '',
        previewVideo: course.previewVideo || '',
        categoryId: course.categoryId?._id || course.categoryId || '',
        levelId: course.levelId || '',
        status: course.status || 'draft',
        rejectionReason: course.rejectionReason || '',
        prerequisites: course.prerequisites || [],
        targetAudience: course.targetAudience || []
      });
    }
  }, [course]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price)
      };

      if (isAdminUser) {
        await adminApi.updateCourse(courseId, payload);
      } else {
        await coursesApi.updateCourse(courseId, payload);
      }

      toast.success('اطلاعات دوره با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ذخیره اطلاعات دوره');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReview = async () => {
    if (!confirm('آیا از ارسال این دوره برای بررسی اطمینان دارید؟')) return;
    setLoading(true);
    
    try {
      await coursesApi.requestCourseReview(courseId);
      toast.success('دوره برای بررسی و انتشار ارسال شد');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      router.push('/instructor/courses');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ارسال برای بررسی');
      setLoading(false);
    }
  };

  const addPrereq = () => {
    if (!prereqInput.trim()) return;
    setFormData(prev => ({ ...prev, prerequisites: [...prev.prerequisites, prereqInput.trim()] }));
    setPrereqInput('');
  };

  const removePrereq = (idx: number) => {
    setFormData(prev => ({ ...prev, prerequisites: prev.prerequisites.filter((_, i) => i !== idx) }));
  };

  if (loadingCourse) {
    return <div className="flex justify-center p-16"><Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header with Quick Navigation */}
      <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href={isAdminUser ? "/admin/courses" : "/instructor/courses"} 
            className="p-2.5 bg-[var(--neo-surface-2)] rounded-2xl hover:bg-[var(--neo-border)] transition-colors"
            title="بازگشت به لیست دوره‌ها"
          >
            <ArrowRight className="w-5 h-5 text-[var(--neo-text-secondary)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[var(--neo-text-main)]">{formData.title || 'ویرایش دوره'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                formData.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                formData.status === 'pending_review' || formData.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                formData.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                'bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]'
              }`}>
                {formData.status === 'published' ? 'منتشر شده' :
                 formData.status === 'pending_review' || formData.status === 'pending' ? 'در انتظار بررسی' :
                 formData.status === 'rejected' ? 'رد شده' : 'پیش‌نویس'}
              </span>
            </div>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">شناسه یکتا: {course?.slug || courseId}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {course?.slug && (
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="px-3 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              مشاهده در سایت
            </Link>
          )}

          <Link
            href={`/instructor/courses/${courseId}/students`}
            className="px-3 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            دانشجویان
          </Link>

          {(formData.status === 'draft' || formData.status === 'rejected') && !isAdminUser && (
            <button 
              onClick={handleRequestReview}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              ارسال برای بررسی
            </button>
          )}
        </div>
      </div>

      {formData.status === 'rejected' && formData.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-800 text-sm mb-0.5">دوره شما رد شده است</h3>
            <p className="text-rose-700 text-xs">{formData.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-[var(--neo-border)]">
        <button 
          id="tab-course-info"
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-3 font-bold text-sm transition-colors flex items-center gap-2 ${
            activeTab === 'info' 
              ? 'text-[var(--neo-primary)] border-b-2 border-[var(--neo-primary)]' 
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          اطلاعات و رسانه دوره
        </button>
        <button 
          id="tab-course-curriculum"
          onClick={() => setActiveTab('curriculum')}
          className={`pb-3 px-3 font-bold text-sm transition-colors flex items-center gap-2 ${
            activeTab === 'curriculum' 
              ? 'text-[var(--neo-primary)] border-b-2 border-[var(--neo-primary)]' 
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          سرفصل‌ها، دروس و جلسات
        </button>
      </div>

      {/* Content Tabs */}
      {activeTab === 'info' ? (
        <form onSubmit={handleInfoSubmit} className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
            <h2 className="text-base font-black text-[var(--neo-text-main)]">مشخصات اصلی دوره</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">عنوان دوره *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نامک یکتا (Slug) *</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">دسته‌بندی</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium"
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name || c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">قیمت دوره (تومان) *</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium text-left dir-ltr"
                  placeholder="0 برای دوره رایگان"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">توضیح کوتاه دوره</label>
              <textarea 
                value={formData.shortDescription}
                onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                rows={2}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium resize-none"
                placeholder="خلاصه دوره در یک الی دو جمله..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">توضیحات کامل و سرفصل‌ها</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={6}
                className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm font-medium resize-none"
                placeholder="توضیحات جامع دوره، اهداف و دستاوردهای دانشجو..."
              />
            </div>
          </div>

          {/* Media Section: Thumbnail & Preview Video */}
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
            <div>
              <h2 className="text-base font-black text-[var(--neo-text-main)]">تصویر پوستر و ویدیوی پیش‌نمایش دوره</h2>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">آپلود مستقیم فایل یا قرار دادن نشانی وب جهت نمایش در کارت و صفحه معرفی دوره</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MediaUploader
                  id="course-thumbnail-uploader"
                  label="تصویر شاخص (پوستر دوره)"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                  accept="image/*"
                  helpText="فرمت‌های JPG، PNG و WebP (حداکثر ۱۰ مگابایت)"
                  previewType="image"
                />
              </div>

              <div>
                <MediaUploader
                  id="course-preview-video-uploader"
                  label="ویدیوی تیزر یا پیش‌نمایش رایگان دوره"
                  value={formData.previewVideo}
                  onChange={(url) => setFormData(prev => ({ ...prev, previewVideo: url }))}
                  accept="video/*"
                  helpText="فرمت MP4، WebM یا لینک مستقیم آپارات / یوتیوب"
                  previewType="video"
                />
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-4">
            <h2 className="text-base font-black text-[var(--neo-text-main)]">پیش‌نیازهای دوره</h2>
            <div className="flex gap-2">
              <input 
                type="text"
                value={prereqInput}
                onChange={e => setPrereqInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPrereq(); } }}
                placeholder="مثال: آشنایی مقدماتی با HTML و CSS"
                className="flex-1 px-4 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-sm outline-none"
              />
              <button
                type="button"
                onClick={addPrereq}
                className="px-4 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] text-xs font-bold rounded-xl transition"
              >
                افزودن
              </button>
            </div>

            {formData.prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.prerequisites.map((p, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-lg text-xs font-medium border border-[var(--neo-border)]">
                    {p}
                    <button type="button" onClick={() => removePrereq(idx)} className="text-rose-500 hover:text-rose-700">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-[var(--neo-primary)] hover:opacity-95 text-white font-bold rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره تغییرات دوره
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)]">
          <CurriculumBuilder courseId={courseId} />
        </div>
      )}
    </div>
  );
}
