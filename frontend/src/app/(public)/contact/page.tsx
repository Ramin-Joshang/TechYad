'use client';

import { useState } from 'react';
import { generalApi } from '@/features/general/api/general.api';
import { MapPin, Phone, Mail, Clock, Send, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/BrandSocialIcons';
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = 'لطفاً نام و نام خانوادگی خود را وارد کنید';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'نام باید حداقل دارای ۳ کاراکتر باشد';
    }

    // Validate Phone (Iranian standard mobile format: 09... or +989...)
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(?:0|\+98)?9\d{9}$/;
    if (!cleanPhone) {
      newErrors.phone = 'لطفاً شماره موبایل خود را وارد کنید';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'شماره موبایل وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
    }

    // Validate Email (if entered)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'فرمت آدرس ایمیل معتبر نمی‌باشد';
      }
    }

    // Validate Subject
    if (!formData.subject) {
      newErrors.subject = 'لطفاً موضوع پیام را انتخاب کنید';
    }

    // Validate Message
    if (!formData.message.trim()) {
      newErrors.message = 'لطفاً متن پیام خود را بنویسید';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'متن پیام باید حداقل شامل ۱۰ کاراکتر باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('لطفاً خطاهای فرم را برطرف نمایید');
      return;
    }

    setIsSubmitting(true);
    try {
      await generalApi.submitContact(formData);
      toast.success('پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ارسال پیام. لطفا دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--neo-text-main)] mb-3 sm:mb-4">تماس با ما</h1>
          <p className="text-sm sm:text-lg text-[var(--neo-text-secondary)] max-w-2xl mx-auto">
            سوالی دارید یا نیاز به مشاوره دارید؟ ما همیشه آماده شنیدن صدای شما هستیم. از طریق راه‌های زیر با ما در ارتباط باشید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {/* Contact Details */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-[var(--neo-border)]">
              <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-6">اطلاعات تماس</h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)] mb-1">آدرس ما</div>
                    <div className="text-[var(--neo-text-secondary)] text-sm leading-relaxed">تهران، میدان آزادی، بلوار پژوهش، پارک علم و فناوری، ساختمان شماره ۲</div>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)] mb-1">شماره تماس و پشتیبانی</div>
                    <div className="text-[var(--neo-text-secondary)] text-sm text-right">
                      <a 
                        href="tel:+989372731037" 
                        dir="ltr"
                        style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}
                        className="hover:text-[var(--neo-primary)] transition-colors font-mono tracking-wider font-bold"
                      >
                        +98 937 273 1037
                      </a>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] rounded-2xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)] mb-1">پست الکترونیک</div>
                    <div className="text-[var(--neo-text-secondary)] text-sm">
                      <a 
                        href="mailto:support@tecyad.ir" 
                        dir="ltr"
                        style={{ direction: 'ltr' }}
                        className="hover:text-[var(--neo-primary)] transition-colors font-mono"
                      >
                        support@tecyad.ir
                      </a>
                    </div>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)] mb-1">ساعات پاسخگویی</div>
                    <div className="text-[var(--neo-text-secondary)] text-sm">شنبه تا چهارشنبه: ۸ الی ۱۸</div>
                    <div className="text-[var(--neo-text-secondary)] text-sm">پنجشنبه: ۸ الی ۱۳</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Direct Support */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">نیاز به پشتیبانی سریع دارید؟</h3>
                <p className="text-slate-300 text-sm mb-6">پاسخگویی آنلاین در کمترین زمان</p>
                
                <div className="space-y-3">
                  <a 
                    href="https://t.me/tecyad_ir" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition border border-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#229ED9] text-white flex items-center justify-center shrink-0">
                        <TelegramIcon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">کانال و پشتیبانی تلگرام</span>
                        <span dir="ltr" style={{ direction: 'ltr' }} className="text-xs text-slate-300 font-mono block">@tecyad_ir</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href="https://wa.me/989372731037" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition border border-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">ارتباط در واتس‌اپ</span>
                        <span dir="ltr" style={{ direction: 'ltr' }} className="text-xs text-slate-300 font-mono block">0937 273 1037</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </a>

                  <a 
                    href="https://instagram.com/tecyad.ir" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl transition border border-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">صفحه رسمی اینستاگرام</span>
                        <span dir="ltr" style={{ direction: 'ltr' }} className="text-xs text-slate-300 font-mono block">@tecyad.ir</span>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-[var(--neo-border)]">
              <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">ارسال پیام</h2>
              <p className="text-[var(--neo-text-muted)] mb-8">فرم زیر را پر کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند.</p>

              {isSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="text-sm font-medium">
                    پیام شما با موفقیت ثبت شد. همکاران ما در اولین فرصت با شماره تلفن شما تماس خواهند گرفت.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">
                      نام و نام خانوادگی <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className={`w-full bg-[var(--neo-bg)] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition ${
                        errors.name ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)] focus:ring-[var(--neo-primary)]'
                      }`}
                      placeholder="مثال: علی رضایی"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">
                      شماره موبایل <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      className={`w-full bg-[var(--neo-bg)] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-left dir-ltr transition ${
                        errors.phone ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)] focus:ring-[var(--neo-primary)]'
                      }`}
                      placeholder="09123456789"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">ایمیل (اختیاری)</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className={`w-full bg-[var(--neo-bg)] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 text-left dir-ltr transition ${
                        errors.email ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)] focus:ring-[var(--neo-primary)]'
                      }`}
                      placeholder="ali@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">
                      موضوع پیام <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={formData.subject}
                      onChange={e => handleInputChange('subject', e.target.value)}
                      className={`w-full bg-[var(--neo-bg)] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition ${
                        errors.subject ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)] focus:ring-[var(--neo-primary)]'
                      }`}
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="مشاوره ثبت‌نام">مشاوره ثبت‌نام</option>
                      <option value="پشتیبانی فنی">پشتیبانی فنی دوره‌ها</option>
                      <option value="همکاری">پیشنهاد همکاری</option>
                      <option value="انتقادات و پیشنهادات">انتقادات و پیشنهادات</option>
                      <option value="سایر">سایر موارد</option>
                    </select>
                    {errors.subject && (
                      <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--neo-text-secondary)] mb-2">
                    متن پیام <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    rows={5}
                    value={formData.message}
                    onChange={e => handleInputChange('message', e.target.value)}
                    className={`w-full bg-[var(--neo-bg)] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 resize-none transition ${
                      errors.message ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)] focus:ring-[var(--neo-primary)]'
                    }`}
                    placeholder="پیام خود را به صورت کامل بنویسید (حداقل ۱۰ کاراکتر)..."
                  ></textarea>
                  {errors.message && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--neo-primary)] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition disabled:opacity-70 shadow-md"
                >
                  <Send className="w-5 h-5 rotate-180" />
                  {isSubmitting ? 'در حال ارسال پیام...' : 'ارسال پیام'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-[var(--neo-border)] rounded-3xl h-80 flex items-center justify-center overflow-hidden border border-[var(--neo-border)] relative shadow-inner">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/400')] opacity-50 object-cover grayscale"></div>
          <div className="relative z-10 bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-lg font-bold text-[var(--neo-text-main)] flex items-center gap-3 border border-white">
            <MapPin className="w-6 h-6 text-red-500" />
            دفتر مرکزی تک‌یاد - تهران، میدان آزادی
          </div>
        </div>
      </div>
    </main>
  );
}
