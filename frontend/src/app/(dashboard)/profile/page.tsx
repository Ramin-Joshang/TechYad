'use client';

import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { mediaApi } from '@/features/media/api/media.api';
import { Loader2, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await authApi.updateProfile(formData);
      if (response.success) {
        setStatus('success');
        setMessage('پروفایل با موفقیت بروزرسانی شد.');
        updateUser(response.data);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'خطا در بروزرسانی پروفایل');
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
      // Auto-save the avatar
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تنظیمات پروفایل</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.firstName.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">تصویر پروفایل</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer hover:bg-gray-200 transition">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  آپلود تصویر جدید
                </label>
                {formData.avatar && (
                   <button type="button" onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))} className="text-sm text-red-500 hover:underline">حذف</button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">فرمت‌های مجاز: JPG, PNG</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نام</label>
              <input 
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نام خانوادگی</label>
              <input 
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ایمیل</label>
            <input 
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 dir-ltr text-left cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1.5">ایمیل قابل تغییر نیست.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نقش کاربری</label>
            <input 
              type="text"
              value={user?.role || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 dir-ltr text-left cursor-not-allowed uppercase"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
            >
              {status === 'loading' ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
