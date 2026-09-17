'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, Plus, Video, Calendar, Users, ArrowRight } from 'lucide-react';

export default function InstructorClassesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    mode: 'online',
    startDate: '',
    price: 0,
    maxStudents: 50
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['instructor-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/instructor/classes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      setShowForm(false);
      setFormData({
        title: '',
        slug: '',
        shortDescription: '',
        mode: 'online',
        startDate: '',
        price: 0,
        maxStudents: 50
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">کلاس‌های زنده</h1>
          <p className="text-gray-500 mt-1">مدیریت کلاس‌های آنلاین شما</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            ایجاد کلاس جدید
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">ایجاد کلاس زنده جدید</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان کلاس</label>
              <input 
                required type="text" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">شناسه URL (انگلیسی)</label>
              <input 
                required type="text" dir="ltr"
                value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">توضیح کوتاه</label>
            <textarea 
              required rows={2}
              value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاریخ شروع</label>
              <input 
                required type="datetime-local" dir="ltr"
                value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">قیمت (تومان)</label>
              <input 
                required type="number" min="0"
                value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ظرفیت</label>
              <input 
                required type="number" min="1"
                value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: Number(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button 
              type="submit" disabled={createMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : <Video className="w-5 h-5"/>}
              ثبت کلاس
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 py-12 flex justify-center text-blue-600"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : classes?.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-gray-500 font-medium bg-white rounded-3xl border border-dashed border-gray-200">
            هیچ کلاس زنده‌ای ندارید.
          </div>
        ) : (
          classes?.map((cls: any) => (
            <div key={cls._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  cls.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {cls.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{cls.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{cls.shortDescription}</p>
              
              <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(cls.startDate).toLocaleDateString('fa-IR')}</div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" /> ظرفیت: {cls.maxStudents} نفر</div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="font-bold text-blue-600">{cls.price === 0 ? 'رایگان' : `${cls.price.toLocaleString()} تومان`}</span>
                {cls.meetingLink && (
                  <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors">
                    ورود به اتاق
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
