'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { MediaUploader } from '@/components/common/MediaUploader';
import { 
  Settings, CreditCard, MessageSquare, Shield, Globe, 
  Check, Loader2, Save, Image as ImageIcon, Award, 
  ExternalLink, Sparkles, Building2, HelpCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'trust' | 'payments' | 'sms' | 'legal'>('general');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { isLoading } = useQuery({
    queryKey: ['superAdminSettings'],
    queryFn: () => superAdminApi.getSettings().then((res: any) => {
      setFormData(res.data || {});
      return res.data;
    })
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updateSettings(data),
    onSuccess: () => {
      toast.success('تنظیمات با موفقیت ذخیره شد و روی سراسر سایت اعمال گردید');
      queryClient.invalidateQueries({ queryKey: ['superAdminSettings'] });
      queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ذخیره تنظیمات');
    }
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const tabs = [
    { id: 'general', label: 'عمومی و سئو', icon: Globe },
    { id: 'branding', label: 'لوگو و برندینگ', icon: ImageIcon },
    { id: 'trust', label: 'نمادهای اعتماد و مجوزها', icon: Award },
    { id: 'payments', label: 'درگاه‌های پرداخت', icon: CreditCard },
    { id: 'sms', label: 'پیامک و ارتباطات', icon: MessageSquare },
    { id: 'legal', label: 'قوانین و حریم خصوصی', icon: Shield },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)] mb-3" />
        <span className="text-sm font-bold text-gray-600">در حال بارگذاری تنظیمات سامانه...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] rounded-2xl">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">تنظیمات کلان و هویت بصری سایت</h1>
            <p className="text-[var(--neo-text-secondary)] text-xs mt-1">
              مدیریت لوگو، نمادهای اعتماد، اطلاعات تماس، متاتگ‌های سئو، درگاه‌های پرداخت و قوانین
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm hover:shadow transition w-full sm:w-auto justify-center disabled:opacity-70 text-sm"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ذخیره تمام تنظیمات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-xs font-bold ${
                  isActive 
                    ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
          
          {/* 1. General & SEO Settings */}
          {activeTab === 'general' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">تنظیمات عمومی و سئو (SEO)</h2>
                <p className="text-xs text-gray-400 mt-1">اطلاعات پایه نمایش سایت در موتورهای جستجو و پیام‌رسان‌ها</p>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">نام سایت (Title پیش‌فرض)</label>
                  <input
                    type="text"
                    value={formData.siteName || ''}
                    onChange={e => handleChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none text-xs transition"
                    placeholder="مثال: تک‌یاد | پلتفرم جامع آموزش آنلاین و مهارت‌های فنی"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">توضیحات سئو (Meta Description)</label>
                  <textarea
                    rows={3}
                    value={formData.seoDescription || ''}
                    onChange={e => handleChange('seoDescription', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none text-xs transition resize-none leading-relaxed"
                    placeholder="توضیحات کوتاه برای نمایش در نتایج جستجوی گوگل و پیش‌نمایش شبکه‌های اجتماعی..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">کلمات کلیدی سئو (با کاما یا ویرگول جدا کنید)</label>
                  <input
                    type="text"
                    value={formData.seoKeywords || ''}
                    onChange={e => handleChange('seoKeywords', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none text-xs transition"
                    placeholder="برنامه‌نویسی, هوش مصنوعی, طراحی وب, تک‌یاد, آموزش آنلاین"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800">ایمیل پشتیبانی رسمی</label>
                    <input
                      type="email"
                      value={formData.supportEmail || ''}
                      onChange={e => handleChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none text-xs text-left dir-ltr"
                      placeholder="support@tecyad.ir"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800">تلفن پشتیبانی و تماس</label>
                    <input
                      type="tel"
                      value={formData.supportPhone || ''}
                      onChange={e => handleChange('supportPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none text-xs text-left dir-ltr"
                      placeholder="021-91234567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Branding & Logo Settings */}
          {activeTab === 'branding' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">لوگو و هویت بصری سایت</h2>
                <p className="text-xs text-gray-400 mt-1">
                  آپلود لوگوی اصلی هدر، فاوآیکون مرورگر و تصویر فوتر
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Logo */}
                <div className="space-y-2">
                  <MediaUploader
                    id="site-logo-uploader"
                    label="لوگوی اصلی هدر سایت (Header Logo)"
                    value={formData.siteLogo}
                    onChange={(url) => handleChange('siteLogo', url)}
                    helpText="ابعاد پیشنهادی: 240x80 پیکسل با فرمت شفاف PNG، SVG یا WebP"
                    previewType="image"
                  />
                  {formData.siteLogo && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-bold">پیش‌نمایش در هدر:</span>
                      <img src={formData.siteLogo} alt="Logo Preview" className="h-9 object-contain max-w-[160px]" />
                    </div>
                  )}
                </div>

                {/* Favicon */}
                <div className="space-y-2">
                  <MediaUploader
                    id="site-favicon-uploader"
                    label="فاوآیکون مرورگر (Favicon)"
                    value={formData.siteFavicon}
                    onChange={(url) => handleChange('siteFavicon', url)}
                    helpText="آیکون ۳۲x۳۲ یا ۶۴x۶۴ در فرمت PNG یا ICO برای نمایش در تب مرورگر"
                    previewType="image"
                  />
                  {formData.siteFavicon && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-bold">پیش‌نمایش آیکون:</span>
                      <img src={formData.siteFavicon} alt="Favicon Preview" className="w-7 h-7 object-contain rounded" />
                    </div>
                  )}
                </div>

                {/* Footer Logo */}
                <div className="space-y-2 md:col-span-2">
                  <MediaUploader
                    id="site-footer-logo-uploader"
                    label="لوگوی اختصاصی فوتر (اختیاری)"
                    value={formData.siteFooterLogo}
                    onChange={(url) => handleChange('siteFooterLogo', url)}
                    helpText="در صورت عدم آپلود، همان لوگوی اصلی هدر در فوتر استفاده می‌شود."
                    previewType="image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Trust Badges & Licenses */}
          {activeTab === 'trust' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">نمادهای اعتماد الکترونیکی و مجوزها</h2>
                <p className="text-xs text-gray-400 mt-1">
                  پیکربندی اینماد (eNamad)، ساماندهی، نشان ملی ثبت و نمادهای اعتباری فوتر
                </p>
              </div>

              <div className="space-y-6">
                {/* Enamad */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-sm">
                        اینماد
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">نماد اعتماد الکترونیکی (اینماد)</h3>
                        <p className="text-xs text-gray-400">نمایش کد و لوگوی ستاره‌دار اینماد در انتهای سایت</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.enamadActive !== false}
                        onChange={e => handleChange('enamadActive', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">کد HTML یا لینک اختصاصی اینماد</label>
                    <textarea
                      rows={2}
                      value={formData.enamadCode || ''}
                      onChange={e => handleChange('enamadCode', e.target.value)}
                      placeholder='<a referrerpolicy="origin" target="_blank" href="https://trustseal.enamad.ir/...">...'
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-left dir-ltr outline-none"
                    />
                  </div>
                </div>

                {/* Samandehi */}
                <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-sm">
                        رسانه
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">نشان ساماندهی رسانه‌های دیجیتال</h3>
                        <p className="text-xs text-gray-400">ثبت رسمی در وزارت فرهنگ و ارشاد اسلامی</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.samandehiActive !== false}
                        onChange={e => handleChange('samandehiActive', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700">کد HTML یا کد رهگیری ساماندهی</label>
                    <textarea
                      rows={2}
                      value={formData.samandehiCode || ''}
                      onChange={e => handleChange('samandehiCode', e.target.value)}
                      placeholder='<img id="..." src="https://logo.samandehi.ir/..." ...>'
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-left dir-ltr outline-none"
                    />
                  </div>
                </div>

                {/* Custom Trust Badge Image */}
                <div className="space-y-2">
                  <MediaUploader
                    id="custom-trust-badge"
                    label="آپلود نشان اختصاصی نماد اعتماد یا گواهینامه بین‌المللی"
                    value={formData.customTrustBadgeUrl}
                    onChange={(url) => handleChange('customTrustBadgeUrl', url)}
                    helpText="تصویر گواهینامه‌ها، استاندارد ایزو، یا نماد اختصاصی موسسه برای نمایش در فوتر"
                    previewType="image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Payment Gateways */}
          {activeTab === 'payments' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">پیکربندی درگاه‌های پرداخت اینترنتی</h2>
                <p className="text-xs text-gray-400 mt-1">تنظیمات درگاه‌های شاپرک و درگاه تستی جهت ثبت‌نام و خرید دوره‌ها</p>
              </div>
              
              <div className="p-5 border-2 border-blue-100 bg-blue-50/40 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">M</div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">درگاه پرداخت آزمایشی (Mock Gateway)</h3>
                      <p className="text-xs text-gray-500">محیط تست بدون نیاز به تراکنش بانکی واقعی</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.mockGatewayEnabled !== false}
                      onChange={e => handleChange('mockGatewayEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                  </label>
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold">Z</div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">درگاه زرین‌پال (ZarinPal)</h3>
                      <p className="text-xs text-gray-500">اتصال به درگاه پرداخت رسمی زرین‌پال</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700">کد مرچنت زرین‌پال (Merchant ID)</label>
                  <input
                    type="text"
                    value={formData.zarinpalMerchantId || ''}
                    onChange={e => handleChange('zarinpalMerchantId', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-left font-mono text-xs"
                    dir="ltr"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. SMS & OTP */}
          {activeTab === 'sms' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">پیکربندی سامانه پیامکی و احراز هویت</h2>
                <p className="text-xs text-gray-400 mt-1">تنظیمات ارسال پیامک‌های خوش‌آمدگویی، یادآوری کلاس‌ها و کدهای یکبارمصرف</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">ارائه‌دهنده پیامک</label>
                  <select
                    value={formData.smsProvider || 'mock'}
                    onChange={e => handleChange('smsProvider', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none text-xs"
                  >
                    <option value="mock">آزمایشی و لاگ سرور (Mock Logger)</option>
                    <option value="kavenegar">کاوه نگار (Kavenegar)</option>
                    <option value="ghasedak">قاصدک (Ghasedak)</option>
                    <option value="farazsms">فراز اس‌ام‌اس (FarazSMS)</option>
                  </select>
                </div>

                {formData.smsProvider !== 'mock' && (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                    <label className="text-xs font-bold text-gray-800">API Key سامانه پیامکی</label>
                    <input
                      type="password"
                      value={formData.smsApiKey || ''}
                      onChange={e => handleChange('smsApiKey', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none text-xs text-left font-mono"
                      dir="ltr"
                      placeholder="کلید احراز هویت وب‌سرویس پیامک"
                    />
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-xs">ارسال پیامک تایید ورود و ثبت‌نام (OTP)</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">در صورت غیرفعال بودن، کد ۱۲۳۴۵ برای تست فعال خواهد بود</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.requireOtp !== false}
                      onChange={e => handleChange('requireOtp', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 6. Legal / Privacy / Rules */}
          {activeTab === 'legal' && (
            <div className="p-8 space-y-6 animate-in fade-in flex flex-col h-full">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">قوانین، مقررات و حریم خصوصی</h2>
                <p className="text-xs text-gray-400 mt-1">متن صفحات عمومی /rules و /privacy برای مطالعه کاربران</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">متن قوانین و مقررات آموزشی (صفحه /rules)</label>
                  <textarea
                    rows={6}
                    value={formData.termsOfService || formData.termsAndConditions || ''}
                    onChange={e => handleChange('termsOfService', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs leading-relaxed"
                    placeholder="قوانین استفاده از دوره‌ها، تعهدات دانشجویان و شرایط استرداد وجه..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800">سیاست حریم خصوصی (صفحه /privacy)</label>
                  <textarea
                    rows={6}
                    value={formData.privacyPolicy || ''}
                    onChange={e => handleChange('privacyPolicy', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs leading-relaxed"
                    placeholder="توضیحات مربوط به نگهداری اطلاعات هویتی و امنیت داده‌های کاربران..."
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
