'use client';

import { useState } from 'react';
import { generalApi } from '@/features/general/api/general.api';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await generalApi.submitContact(formData);
      toast.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('خطا در ارسال پیام. لطفا دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">تماس با ما</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            سوالی دارید یا نیاز به مشاوره دارید؟ ما همیشه آماده شنیدن صدای شما هستیم. از طریق راه‌های زیر با ما در ارتباط باشید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">اطلاعات تماس</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">آدرس ما</div>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      تهران، میدان ونک، خیابان ملاصدرا، پلاک ۱۲، ساختمان تک‌یاد
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">شماره تلفن</div>
                    <div className="text-gray-600 text-sm dir-ltr text-right">۰۲۱-۸۸۸۸۸۸۸۸</div>
                    <div className="text-gray-600 text-sm dir-ltr text-right">۰۹۱۲-۱۲۳۴۵۶۷</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">ایمیل سازمانی</div>
                    <div className="text-gray-600 text-sm">info@techyad.ir</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">ساعات پاسخگویی</div>
                    <div className="text-gray-600 text-sm">شنبه تا چهارشنبه: ۸ الی ۱۸</div>
                    <div className="text-gray-600 text-sm">پنجشنبه: ۸ الی ۱۳</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Direct Support */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/500/500')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">نیاز به پشتیبانی سریع دارید؟</h3>
                <p className="text-slate-300 text-sm mb-6">پاسخگویی آنلاین در کمتر از ۱۰ دقیقه</p>
                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition border border-white/5">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-sm">گفتگو در تلگرام</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                  </a>
                  <a href="#" className="flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition border border-white/5">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium text-sm">گفتگو در واتس‌اپ</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ارسال پیام</h2>
              <p className="text-gray-500 mb-8">فرم زیر را پر کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">نام و نام خانوادگی</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: علی رضایی"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">شماره موبایل</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr"
                      placeholder="0912 345 6789"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ایمیل (اختیاری)</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left dir-ltr"
                      placeholder="ali@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">موضوع پیام</label>
                    <select 
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="مشاوره ثبت‌نام">مشاوره ثبت‌نام</option>
                      <option value="پشتیبانی فنی">پشتیبانی فنی دوره‌ها</option>
                      <option value="همکاری">پیشنهاد همکاری</option>
                      <option value="انتقادات و پیشنهادات">انتقادات و پیشنهادات</option>
                      <option value="سایر">سایر موارد</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">متن پیام</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="پیام خود را اینجا بنویسید..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-70 shadow-md"
                >
                  <Send className="w-5 h-5 rotate-180" />
                  {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-200 rounded-3xl h-96 flex items-center justify-center overflow-hidden border border-gray-300 relative shadow-inner">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/400')] opacity-50 object-cover grayscale"></div>
          <div className="relative z-10 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-lg font-bold text-gray-800 flex items-center gap-3 border border-white">
            <MapPin className="w-6 h-6 text-red-500" />
            نقشه گوگل در اینجا قرار می‌گیرد
          </div>
        </div>
      </div>
    </main>
  );
}
