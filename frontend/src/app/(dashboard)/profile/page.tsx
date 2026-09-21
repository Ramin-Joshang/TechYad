'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { mediaApi } from '@/features/media/api/media.api';
import { Loader2, Upload, Lock, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Password form state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passStatus, setPassStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [passMessage, setPassMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await authApi.updateProfile(formData);
      if (response.success) {
        setStatus('success');
        setMessage('اطلاعات کاربری با موفقیت بروزرسانی شد.');
        updateUser(response.data);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'خطا در بروزرسانی پروفایل');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus('loading');
    setPassMessage('');

    if (passData.newPassword.length < 8) {
      setPassStatus('error');
      setPassMessage('رمز عبور جدید باید حداقل ۸ کاراکتر باشد.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassStatus('error');
      setPassMessage('رمز عبور جدید و تکرار آن یکسان نیستند.');
      return;
    }

    try {
      const response = await authApi.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      if (response.success) {
        setPassStatus('success');
        setPassMessage('رمز عبور شما با موفقیت تغییر یافت.');
        setPassData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err: any) {
      setPassStatus('error');
      setPassMessage(err.response?.data?.message || 'خطا در تغییر رمز عبور. لطفاً رمز فعلی را بررسی فرمایید.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const res = await mediaApi.uploadFile(file);
      const newAvatar = res.data.url;
      setFormData(prev => ({ ...prev, avatar: newAvatar }));
      try {
        const updateRes = await authApi.updateProfile({ ...formData, avatar: newAvatar });
        if (updateRes.success) {
          updateUser({ avatar: newAvatar });
          setMessage('تصویر پروفایل با موفقیت بروزرسانی شد.');
          setStatus('success');
        }
      } catch (e) { console.error('auto save failed', e); }
    } catch (err) {
      console.error('File upload failed', err);
      alert('خطا در آپلود تصویر');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-black text-[var(--neo-text-main)] mb-1">تنظیمات حساب کاربری</h1>
        <p className="text-sm text-[var(--neo-text-secondary)]">مدیریت اطلاعات هویتی و امنیت رمز عبور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--neo-border)]">
              <UserCheck className="w-5 h-5 text-[var(--neo-primary)]" />
              <h2 className="text-lg font-bold text-[var(--neo-text-main)]">مشخصات عمومی</h2>
            </div>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-[var(--neo-border)]">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 shadow-inner">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.firstName.charAt(0) || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">تصویر پروفایل</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] font-bold text-xs rounded-xl cursor-pointer hover:bg-[var(--neo-border)] transition">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      آپلود تصویر جدید
                    </label>
                    {formData.avatar && (
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))} className="text-xs text-red-500 hover:underline">حذف عکس</button>
                    )}
                  </div>
                  <p className="text-xs text-[var(--neo-text-secondary)] mt-2">فرمت‌های مجاز: JPG, PNG تا حداکثر ۵ مگابایت</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">نام</label>
                  <input 
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition-all text-right"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">نام خانوادگی</label>
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition-all text-right"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">ایمیل (شناسه کاربری)</label>
                <input 
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] dir-ltr text-left cursor-not-allowed font-mono text-sm"
                />
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1.5">ایمیل جهت ورود به سیستم استفاده می‌شود و غیرقابل تغییر است.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-2.5 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition-all disabled:opacity-70 text-sm flex items-center gap-2"
                >
                  {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                  ذخیره اطلاعات
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Column */}
        <div className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--neo-border)]">
              <Lock className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-[var(--neo-text-main)]">تغییر رمز عبور</h2>
            </div>

            {passStatus === 'success' && (
              <div className="mb-5 p-3.5 bg-green-50 text-green-700 rounded-xl text-xs border border-green-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                {passMessage}
              </div>
            )}

            {passStatus === 'error' && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                {passMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">رمز عبور فعلی</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passData.currentPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] text-sm dir-ltr text-left"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">رمز عبور جدید</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passData.newPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="حداقل ۸ کاراکتر"
                    className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] text-sm dir-ltr text-left"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">تکرار رمز عبور جدید</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passData.confirmPassword}
                    onChange={handlePassChange}
                    required
                    placeholder="تکرار رمز جدید"
                    className="w-full px-3.5 py-2 pl-9 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] text-sm dir-ltr text-left"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={passStatus === 'loading'}
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all disabled:opacity-70 text-xs flex items-center justify-center gap-2"
                >
                  {passStatus === 'loading' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      در حال تغییر رمز...
                    </>
                  ) : (
                    'بروزرسانی رمز عبور'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Role & Account Information Badge */}
          <div className="bg-gray-50 border border-[var(--neo-border)] rounded-2xl p-5 text-xs text-gray-600 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">نقش سیستمی:</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase text-[11px]">
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">وضعیت حساب:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                فعال و تایید شده
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
