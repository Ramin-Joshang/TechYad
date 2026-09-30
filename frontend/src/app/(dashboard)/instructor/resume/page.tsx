'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorsApi } from '@/features/instructors/api/instructors.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  User, Award, GraduationCap, Briefcase, Plus, Trash2, 
  Save, Loader2, CheckCircle2, Globe, 
  ExternalLink, Sparkles, BookOpen, Layers
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUploader } from '@/components/common/MediaUploader';

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function InstructorResumePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'info' | 'education' | 'experience' | 'specialties' | 'social'>('info');

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['myInstructorProfile'],
    queryFn: () => instructorsApi.getMyProfile().then(res => res.data)
  });

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    avatar: '',
    specialties: [] as string[],
    education: [] as {
      degree: string;
      field: string;
      university: string;
      startYear?: number | '';
      endYear?: number | '';
    }[],
    experience: [] as {
      position: string;
      company: string;
      startYear?: number | '';
      endYear?: number | '';
      current?: boolean;
      description?: string;
    }[],
    socialLinks: {
      linkedin: '',
      website: '',
      instagram: ''
    }
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    if (profileData) {
      setFormData({
        title: profileData.title || user?.specialty || '',
        bio: profileData.bio || user?.bio || '',
        avatar: profileData.avatar || user?.avatar || '',
        specialties: profileData.specialties || [],
        education: profileData.education || [],
        experience: profileData.experience || [],
        socialLinks: {
          linkedin: profileData.socialLinks?.linkedin || '',
          website: profileData.socialLinks?.website || '',
          instagram: profileData.socialLinks?.instagram || ''
        }
      });
    }
  }, [profileData, user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => instructorsApi.updateMyProfile(data),
    onSuccess: (res) => {
      toast.success('رزومه و اطلاعات پروفایل استاد با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['myInstructorProfile'] });
      if (res?.data?.avatar && user) {
        setUser({ ...user, avatar: res.data.avatar, specialty: res.data.title });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ذخیره‌سازی اطلاعات رزومه');
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Specialties
  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (formData.specialties.includes(newSpecialty.trim())) {
      toast.error('این مهارت قبلاً اضافه شده است');
      return;
    }
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()]
    }));
    setNewSpecialty('');
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  // Education
  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: 'کارشناسی', field: '', university: '', startYear: '', endYear: '' }
      ]
    }));
  };

  const handleUpdateEducation = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const list = [...prev.education];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, education: list };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Experience
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { position: '', company: '', startYear: '', endYear: '', current: false, description: '' }
      ]
    }));
  };

  const handleUpdateExperience = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const list = [...prev.experience];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, experience: list };
    });
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const instructorPublicId = user?.id || user?._id;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 text-[var(--neo-primary)] animate-spin" />
        <p className="text-sm font-medium text-[var(--neo-text-muted)]">در حال دریافت اطلاعات رزومه استاد...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>مدیریت هویت حرفه‌ای و صفحه عمومی استاد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            رزومه و پروفایل عمومی استاد
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl font-medium">
            اطلاعات، سوابق تحصیلی، تجربیات کاری و تخصص‌های شما در صفحه اختصاصی استاد برای عموم دانشجویان نمایش داده می‌شود.
          </p>
        </div>

        {instructorPublicId && (
          <Link
            href={`/instructors/${instructorPublicId}`}
            target="_blank"
            className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2 shrink-0 self-start md:self-center"
          >
            <ExternalLink className="w-4 h-4 text-blue-600" />
            مشاهده صفحه عمومی من
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] overflow-x-auto hide-scrollbar">
        {[
          { id: 'info', label: 'اطلاعات اصلی و بیوگرافی', icon: User },
          { id: 'specialties', label: 'تخصص‌ها و مهارت‌ها', icon: Award },
          { id: 'education', label: 'سوابق تحصیلی', icon: GraduationCap },
          { id: 'experience', label: 'سوابق کاری و شغلی', icon: Briefcase },
          { id: 'social', label: 'شبکه‌های اجتماعی و وب‌سایت', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--neo-surface)] text-[var(--neo-primary)] shadow-sm'
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'info' && (
          <div className="bg-[var(--neo-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-[var(--neo-text-main)] flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--neo-primary)]" />
              اطلاعات معرفی استاد
            </h2>

            {/* Avatar Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--neo-text-secondary)]">تصویر پروفایل استاد</label>
              <MediaUploader
                value={formData.avatar}
                onChange={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                folder="instructors/avatars"
                label="آپلود تصویر پرسنلی / آواتار رسمی"
              />
              <p className="text-[11px] text-[var(--neo-text-muted)]">
                توصیه می‌شود تصویری با وضوح بالا، پس‌زمینه مناسب و کادربندی مربعی انتخاب کنید.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  عنوان شغلی / تخصص نمایشی *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: مدرس ارشد فرانت‌اند و مهندس سیستم‌های توزیع‌شده"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  نام کامل استاد
                </label>
                <input
                  type="text"
                  disabled
                  value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60 text-sm text-[var(--neo-text-muted)] cursor-not-allowed"
                />
                <span className="text-[10px] text-[var(--neo-text-muted)] mt-1 block">
                  نام و نام خانوادگی از بخش ویرایش حساب کاربری قابل تغییر است.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                درباره استاد (بیوگرافی کامل) *
              </label>
              <textarea
                rows={6}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="سوابق، رویکرد آموزشی، دستاوردها و نحوه تعامل خود را با دانشجویان بنویسید..."
                required
                className="w-full p-4 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SPECIALTIES */}
        {activeTab === 'specialties' && (
          <div className="bg-[var(--neo-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--neo-primary)]" />
                تخصص‌ها و مهارت‌های کلیدی
              </h2>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                مهارت‌ها، فریم‌ورک‌ها و حوزه‌های تدریس خود را وارد نمایید. این مهارت‌ها به صورت برچسب در صفحه شما نمایش داده می‌شوند.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={e => setNewSpecialty(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpecialty();
                  }
                }}
                placeholder="مثال: React.js یا معماری میکروسرویس..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
              />
              <button
                type="button"
                onClick={handleAddSpecialty}
                className="px-5 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                افزودن تخصص
              </button>
            </div>

            <div className="pt-2">
              {formData.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {formData.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold shadow-2xs"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(idx)}
                        className="text-blue-500 hover:text-red-600 transition"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--neo-border)] rounded-2xl text-xs text-[var(--neo-text-muted)]">
                  هنوز تخصصی ثبت نشده است. از فیلد بالا مهارت‌های خود را وارد کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EDUCATION */}
        {activeTab === 'education' && (
          <div className="bg-[var(--neo-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[var(--neo-primary)]" />
                  سوابق تحصیلی و دانشگاهی
                </h2>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                  مدارک دانشگاهی، رشته‌های تحصیلی و دانشگاه‌های محل تحصیل خود را ثبت نمایید.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddEducation}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                افزودن مدرک تحصیلی
              </button>
            </div>

            <div className="space-y-4">
              {formData.education.length > 0 ? (
                formData.education.map((edu, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        مدرک تحصیلی شماره {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                        title="حذف این مورد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">مقطع تحصیلی</label>
                        <select
                          value={edu.degree}
                          onChange={e => handleUpdateEducation(idx, 'degree', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-bold outline-none"
                        >
                          <option value="دیپلم">دیپلم</option>
                          <option value="کاردانی">کاردانی</option>
                          <option value="کارشناسی">کارشناسی</option>
                          <option value="کارشناسی ارشد">کارشناسی ارشد</option>
                          <option value="دکتری">دکتری</option>
                          <option value="پسادکتری">پسادکتری</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">رشته تحصیلی *</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={e => handleUpdateEducation(idx, 'field', e.target.value)}
                          placeholder="مهندسی کامپیوتر / نرم‌افزار"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">دانشگاه / موسسه *</label>
                        <input
                          type="text"
                          value={edu.university}
                          onChange={e => handleUpdateEducation(idx, 'university', e.target.value)}
                          placeholder="دانشگاه صنعتی شریف"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">سال شروع</label>
                        <input
                          type="number"
                          value={edu.startYear || ''}
                          onChange={e => handleUpdateEducation(idx, 'startYear', e.target.value ? Number(e.target.value) : '')}
                          placeholder="۱۳۹۵"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-mono outline-none dir-ltr text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">سال فراغت / پایان</label>
                        <input
                          type="number"
                          value={edu.endYear || ''}
                          onChange={e => handleUpdateEducation(idx, 'endYear', e.target.value ? Number(e.target.value) : '')}
                          placeholder="۱۳۹۹ (یا خالی برای اکنون)"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-mono outline-none dir-ltr text-left"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--neo-border)] rounded-2xl text-xs text-[var(--neo-text-muted)]">
                  هیچ سابقه تحصیلی ثبت نشده است. با کلیک بر روی دکمه بالا، سوابق تحصیلی خود را اضافه کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="bg-[var(--neo-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[var(--neo-primary)]" />
                  سوابق کاری و حرفه‌ای
                </h2>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                  پست‌های شغلی، تجربیات تدریس، فعالیت در پروژه‌ها و شرکت‌های همکار را ثبت کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddExperience}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                افزودن سابقه کاری
              </button>
            </div>

            <div className="space-y-4">
              {formData.experience.length > 0 ? (
                formData.experience.map((exp, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        سابقه کاری شماره {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                        title="حذف این مورد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">سمت یا عنوان شغلی *</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={e => handleUpdateExperience(idx, 'position', e.target.value)}
                          placeholder="مدرس ارشد / مهندس ارشد سیستم"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">نام سازمان / شرکت / آکادمی *</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => handleUpdateExperience(idx, 'company', e.target.value)}
                          placeholder="آکادمی تک‌یاد / شرکت‌های فناور"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">سال شروع</label>
                        <input
                          type="number"
                          value={exp.startYear || ''}
                          onChange={e => handleUpdateExperience(idx, 'startYear', e.target.value ? Number(e.target.value) : '')}
                          placeholder="۱۳۹۸"
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-mono outline-none dir-ltr text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">سال پایان</label>
                        <input
                          type="number"
                          disabled={exp.current}
                          value={exp.endYear || ''}
                          onChange={e => handleUpdateExperience(idx, 'endYear', e.target.value ? Number(e.target.value) : '')}
                          placeholder={exp.current ? 'مشغول به کار' : '۱۴۰۲'}
                          className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-mono outline-none dir-ltr text-left disabled:opacity-50"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={!!exp.current}
                            onChange={e => handleUpdateExperience(idx, 'current', e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          <span>هم‌اکنون مشغول به فعالیت هستم</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--neo-text-secondary)] mb-1">توضیحات دستاوردها یا وظایف (اختیاری)</label>
                      <input
                        type="text"
                        value={exp.description || ''}
                        onChange={e => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="تدریس بیش از ۲۰۰۰ ساعت دوره تخصصی و راهبری تیم توسعه..."
                        className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs outline-none"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--neo-border)] rounded-2xl text-xs text-[var(--neo-text-muted)]">
                  هیچ سابقه کاری ثبت نشده است. با کلیک بر روی دکمه بالا، سوابق حرفه‌ای خود را ثبت کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="bg-[var(--neo-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--neo-primary)]" />
                شبکه‌های حرفه‌ای و وب‌سایت
              </h2>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                لینک‌های ارتباطی و شبکه‌های شغلی خود را جهت دسترسی دانشجویان وارد نمایید.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4 text-blue-600" />
                  لینک پروفایل لینکدین (LinkedIn)
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  وب‌سایت شخصی یا رزومه آنلاین
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.website}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, website: e.target.value }
                  })}
                  placeholder="https://mywebsite.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4 text-pink-600" />
                  اینستاگرام (Instagram)
                </label>
                <input
                  type="text"
                  value={formData.socialLinks.instagram}
                  onChange={e => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/username یا @username"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm dir-ltr text-left font-mono focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex justify-end items-center gap-3 bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-[var(--neo-primary)]/20 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            ذخیره و به‌روزرسانی رزومه استاد
          </button>
        </div>
      </form>
    </div>
  );
}
