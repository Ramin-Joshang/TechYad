'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';
import { Briefcase, MapPin, Clock, Upload, Send, GraduationCap, ChevronLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { MediaUploader } from '@/components/common/MediaUploader';

export default function CareersPage() {
  const { data: jobPositions = [], isLoading } = useQuery({
    queryKey: ['publicJobPositions'],
    queryFn: () => generalApi.getJobPositions().then(res => res.data)
  });

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    jobTitle: '',
    jobPositionId: '',
    specialty: '',
    degree: '',
    experience: '',
    resumeUrl: '',
    demoUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectJob = (job: any) => {
    setFormData(prev => ({
      ...prev,
      jobTitle: job.title,
      jobPositionId: job._id,
      specialty: prev.specialty || job.department || job.title
    }));
    const formElem = document.getElementById('apply-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await generalApi.submitCareer(formData);
      toast.success('درخواست همکاری شما با موفقیت ثبت شد. به زودی نتیجه به شما اطلاع داده خواهد شد.');
      setFormData({
        fullName: '', mobile: '', email: '', jobTitle: '', jobPositionId: '', specialty: '', degree: '', 
        experience: '', resumeUrl: '', demoUrl: '', description: ''
      });
    } catch (error) {
      toast.error('خطا در ثبت درخواست. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-24 pb-32 text-center text-white px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/careers/1920/1080')] opacity-10 mix-blend-overlay object-cover"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">به تیم ما بپیوندید</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            ما در تک‌یاد همیشه به دنبال استعدادهای برتر در زمینه آموزش، تولید محتوا و برنامه‌نویسی هستیم. اگر مهارت و انگیزه بالایی دارید، جای شما اینجاست.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-16">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">مدرس هستید؟</h2>
            <p className="text-[var(--neo-text-secondary)]">
              اگر سابقه تدریس موفق دارید و می‌خواهید دانش خود را با هزاران دانشجو به اشتراک بگذارید، تک‌یاد بهترین بستر برای شماست.
            </p>
          </div>
          <a href="#apply-form" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30">
            درخواست همکاری مدرس <ChevronLeft className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-[var(--neo-text-main)] mb-8">فرصت‌های همکاری فعلی</h2>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobPositions.map((job: any) => (
              <div key={job._id} className="bg-white rounded-2xl p-6 border border-[var(--neo-border)] hover:shadow-lg transition group flex flex-col justify-between">
                <div>
                  <Briefcase className="w-10 h-10 text-[var(--neo-primary)] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-lg text-[var(--neo-text-main)] mb-2">{job.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-[var(--neo-text-muted)] mb-3">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{job.type}</span>
                  </div>
                  {job.description && (
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                      {job.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectJob(job)}
                  className="w-full mt-4 py-2.5 bg-blue-50 hover:bg-[var(--neo-primary)] text-blue-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  ارسال رزومه برای این شغل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="apply-form">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[var(--neo-border)]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--neo-text-main)] mb-4">فرم درخواست همکاری</h2>
            <p className="text-[var(--neo-text-secondary)]">
              {formData.jobTitle ? (
                <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  در حال ثبت درخواست برای: {formData.jobTitle}
                </span>
              ) : (
                'اطلاعات خود را به دقت وارد کنید تا تیم منابع انسانی ما در اسرع وقت بررسی کنند.'
              )}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">شماره موبایل <span className="text-red-500">*</span></label>
                <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">ایمیل <span className="text-red-500">*</span></label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">رشته / تخصص اصلی <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="مثال: برنامه‌نویسی وب، ریاضیات دانشگاهی" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">آخرین مدرک تحصیلی</label>
                <input type="text" placeholder="مثال: کارشناسی ارشد مهندسی کامپیوتر" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">سابقه کار مرتبط</label>
                <input type="text" placeholder="مثال: ۴ سال سابقه تدریس یا توسعه نرم‌افزار" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">لینک رزومه (یا آپلود فایل)</label>
                <div className="flex gap-2 items-center">
                  <input type="url" placeholder="https://..." value={formData.resumeUrl} onChange={e => setFormData({...formData, resumeUrl: e.target.value})} className="flex-1 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left text-sm" />
                  <MediaUploader
                    onChange={(url) => setFormData(prev => ({ ...prev, resumeUrl: url }))}
                    folder="resumes"
                    maxSizeMB={20}
                    accept=".pdf,.doc,.docx,.zip"
                    label="آپلود رزومه"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">لینک نمونه‌کار / گیت‌هاب / ویدیوی نمونه</label>
                <input type="url" placeholder="https://github.com/..." value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">توضیحات تکمیلی یا انگیزه‌نامه</label>
              <textarea rows={4} placeholder="توضیحاتی در مورد سوابق، علایق تدریس و انگیزه همکاری با تک‌یاد..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base shadow-lg shadow-blue-600/30">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  در حال ارسال درخواست...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ارسال درخواست همکاری
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
