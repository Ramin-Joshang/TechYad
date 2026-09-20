'use client';

import { useState, useEffect, } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { adminApi } from '@/features/admin/api/admin.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowRight, Loader2, Save, Send, AlertCircle, 
  CheckCircle, Plus
} from 'lucide-react';
import { CurriculumBuilder } from './CurriculumBuilder';

export default function EditCoursePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const courseId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Data Fetching
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        return adminApi.getCourseById(courseId).then(res => res.data.data || res.data);
      }
      return api.get(`/instructor/courses/${courseId}`).then(res => res.data.data || res.data);
    }
  });

  const { data: chapters, isLoading: loadingChapters } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => coursesApi.getCourseChapters(courseId).then(res => res.data)
  });

  // Since we don't have a specific GET course by ID for instructors, we might need to fallback to getCourses and filter or just use public one
  // Let's create a custom endpoint or just use the slug endpoint if we have slug. For now, assuming GET /instructor/courses/:id exists or we modify backend.
  
  // State for Basic Info
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    price: 0,
    status: 'draft',
    rejectionReason: ''
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        price: course.price || 0,
        status: course.status || 'draft',
        rejectionReason: course.rejectionReason || ''
      });
    }
  }, [course]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await coursesApi.updateCourse(courseId, formData);
      setMessage({ type: 'success', text: 'اطلاعات با موفقیت ذخیره شد' });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'خطا در ذخیره اطلاعات' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReview = async () => {
    if (!confirm('آیا از ارسال این دوره برای بررسی اطمینان دارید؟')) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await coursesApi.requestCourseReview(courseId);
      setMessage({ type: 'success', text: 'دوره برای بررسی ارسال شد' });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      router.push('/instructor/courses');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'خطا در ارسال برای بررسی' });
      setLoading(false);
    }
  };

  if (loadingCourse) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-4">
          <Link href="/instructor/courses" className="p-2 bg-[var(--neo-surface-2)] rounded-xl hover:bg-[var(--neo-surface-2)] transition-colors">
            <ArrowRight className="w-5 h-5 text-[var(--neo-text-secondary)]" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">{formData.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-[var(--neo-text-secondary)]">وضعیت:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                formData.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                formData.status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                formData.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]'
              }`}>
                {formData.status === 'published' ? 'منتشر شده' :
                 formData.status === 'pending_review' ? 'در انتظار تایید' :
                 formData.status === 'rejected' ? 'رد شده' : 'پیش‌نویس'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {(formData.status === 'draft' || formData.status === 'rejected') && (
            <button 
              onClick={handleRequestReview}
              disabled={loading}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              ارسال برای بررسی
            </button>
          )}
        </div>
      </div>

      {formData.status === 'rejected' && formData.rejectionReason && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 text-sm mb-1">دوره شما رد شده است</h3>
            <p className="text-red-700 text-sm">{formData.rejectionReason}</p>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--neo-border)]">
        <button 
          onClick={() => setActiveTab('info')}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === 'info' ? 'text-[var(--neo-primary)] border-b-2 border-[var(--neo-primary)]' : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'}`}
        >
          اطلاعات پایه
        </button>
        <button 
          onClick={() => setActiveTab('curriculum')}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === 'curriculum' ? 'text-[var(--neo-primary)] border-b-2 border-[var(--neo-primary)]' : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'}`}
        >
          سرفصل‌ها و دروس
        </button>
      </div>

      {/* Content */}
      {activeTab === 'info' ? (
        <form onSubmit={handleInfoSubmit} className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] space-y-6">
          <div>
            <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">عنوان دوره</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">توضیح کوتاه</label>
            <textarea 
              value={formData.shortDescription}
              onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">توضیحات کامل</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={8}
              className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">قیمت (تومان)</label>
            <input 
              type="number" 
              required
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div className="pt-4 border-t border-[var(--neo-border)] flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              ذخیره تغییرات
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-[var(--neo-text-main)]">سرفصل‌های دوره</h2>
            <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-sm text-sm flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> فصل جدید
            </button>
          </div>
          
<CurriculumBuilder courseId={courseId} />
        </div>
      )}
    </div>
  );
}
