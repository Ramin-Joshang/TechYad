'use client';

import { useState } from 'react';
import { generalApi } from '@/features/general/api/general.api';
import { Briefcase, MapPin, Clock, Upload, Send, GraduationCap, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const OPPORTUNITIES = [
  { id: 1, title: 'استاد ریاضیات دانشگاهی', type: 'آنلاین / پاره‌وقت', icon: GraduationCap },
  { id: 2, title: 'مدرس برنامه‌نویسی (React)', type: 'حضوری / پاره‌وقت', icon: Briefcase },
  { id: 3, title: 'تولیدکننده محتوای آموزشی', type: 'دورکاری / پروژه‌ای', icon: Briefcase },
  { id: 4, title: 'پشتیبان آموزشی (فیزیک)', type: 'دورکاری / تمام‌وقت', icon: Clock },
];

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    specialty: '',
    degree: '',
    experience: '',
    resumeUrl: '',
    demoUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await generalApi.submitCareer(formData);
      toast.success('درخواست همکاری شما با موفقیت ثبت شد. به زودی نتیجه به شما اطلاع داده خواهد شد.');
      setFormData({
        fullName: '', mobile: '', email: '', specialty: '', degree: '', 
        experience: '', resumeUrl: '', demoUrl: '', description: ''
      });
    } catch (error) {
      toast.error('خطا در ثبت درخواست. لطفا مجددا تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
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
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">مدرس هستید؟</h2>
            <p className="text-gray-600">
              اگر سابقه تدریس موفق دارید و می‌خواهید دانش خود را با هزاران دانشجو به اشتراک بگذارید، تک‌یاد بهترین بستر برای شماست.
            </p>
          </div>
          <a href="#apply-form" className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30">
            درخواست همکاری مدرس <ChevronLeft className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">فرصت‌های همکاری فعلی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OPPORTUNITIES.map(job => (
            <div key={job.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition group">
              <job.icon className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{job.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                {job.type}
              </div>
              <a href="#apply-form" className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                ارسال رزومه <ChevronLeft className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="apply-form">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">فرم درخواست همکاری</h2>
            <p className="text-gray-600">اطلاعات خود را به دقت وارد کنید تا تیم منابع انسانی ما در اسرع وقت بررسی کنند.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل <span className="text-red-500">*</span></label>
                <input required type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ایمیل <span className="text-red-500">*</span></label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رشته / تخصص اصلی <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="مثال: برنامه‌نویسی وب، فیزیک کنکور" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">آخرین مدرک تحصیلی <span className="text-red-500">*</span></label>
                <select required value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">انتخاب کنید...</option>
                  <option value="diploma">دیپلم</option>
                  <option value="bachelor">کارشناسی</option>
                  <option value="master">کارشناسی ارشد</option>
                  <option value="phd">دکتری</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">سابقه تدریس / کار مرتبط <span className="text-red-500">*</span></label>
                <select required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">انتخاب کنید...</option>
                  <option value="none">بدون سابقه</option>
                  <option value="1-3">۱ تا ۳ سال</option>
                  <option value="3-5">۳ تا ۵ سال</option>
                  <option value="5+">بیش از ۵ سال</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">لینک رزومه (Google Drive و...)</label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="url" placeholder="https://..." value={formData.resumeUrl} onChange={e => setFormData({...formData, resumeUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-4 pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">لینک نمونه تدریس (فقط برای اساتید)</label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="url" placeholder="Aparat / YouTube / Drive" value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-4 pl-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-left" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات تکمیلی</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="اگر توضیح خاصی دارید، اینجا بنویسید..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-70 shadow-md"
              >
                <Send className="w-5 h-5 rotate-180" />
                {isSubmitting ? 'در حال ارسال...' : 'ارسال درخواست همکاری'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
