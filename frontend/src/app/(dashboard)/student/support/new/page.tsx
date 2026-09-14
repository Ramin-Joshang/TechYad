'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/features/support/api/support.api';
import { Ticket, ArrowRight, Loader2, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => supportApi.createTicket(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      router.push(`/student/support/${res.data._id}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div>
        <Link href="/student/support" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست تیکت‌ها
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
          <Ticket className="w-8 h-8 text-indigo-500" />
          ایجاد تیکت جدید
        </h1>
        <p className="text-gray-500">لطفاً مشکل یا سوال خود را با جزئیات مطرح کنید.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">موضوع تیکت</label>
            <input 
              type="text" 
              required
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="مثلا: مشکل در پخش ویدیو فصل دوم"
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">دپارتمان</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option value="general">پشتیبانی عمومی</option>
                <option value="technical">پشتیبانی فنی</option>
                <option value="financial">امور مالی و پرداخت</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اولویت بررسی</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option value="low">کم (بررسی در ۴۸ ساعت)</option>
                <option value="medium">متوسط (بررسی در ۲۴ ساعت)</option>
                <option value="high">زیاد (بررسی در سریع‌ترین زمان)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">متن پیام</label>
            <textarea 
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="شرح کامل مشکل یا درخواست شما..."
              className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white resize-y"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={createMutation.isPending || !formData.subject || !formData.message}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              ارسال تیکت
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
