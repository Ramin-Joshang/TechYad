'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { Settings, CreditCard, MessageSquare, Shield, Globe, Check, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
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
      toast.success('تنظیمات با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['superAdminSettings'] });
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
    { id: 'payments', label: 'درگاه‌های پرداخت', icon: CreditCard },
    { id: 'sms', label: 'پیامک و ارتباطات', icon: MessageSquare },
    { id: 'legal', label: 'قوانین و حریم خصوصی', icon: Shield },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">تنظیمات کلان سیستم</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">مدیریت درگاه‌ها، پیامک و پیکربندی‌های اصلی</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-medium rounded-xl transition-colors w-full sm:w-auto justify-center disabled:opacity-70"
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          ذخیره تغییرات
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
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-[var(--neo-primary)]/20 font-bold' 
                    : 'bg-white text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] border border-transparent hover:border-[var(--neo-border)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--neo-text-muted)]'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
          
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] mb-6">تنظیمات عمومی و برندینگ</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">نام سایت (Title)</label>
                  <input
                    type="text"
                    value={formData.siteName || ''}
                    onChange={e => handleChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all"
                    placeholder="مثال: آکادمی آموزشی تک‌یاد"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">توضیحات سئو (Meta Description)</label>
                  <textarea
                    rows={3}
                    value={formData.seoDescription || ''}
                    onChange={e => handleChange('seoDescription', e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all resize-none"
                    placeholder="توضیحات کوتاه برای نمایش در نتایج گوگل..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--neo-text-main)]">ایمیل پشتیبانی</label>
                    <input
                      type="email"
                      value={formData.supportEmail || ''}
                      onChange={e => handleChange('supportEmail', e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--neo-text-main)]">تلفن تماس</label>
                    <input
                      type="tel"
                      value={formData.supportPhone || ''}
                      onChange={e => handleChange('supportPhone', e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none transition-all text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateways */}
          {activeTab === 'payments' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] mb-6">پیکربندی درگاه‌های پرداخت</h2>
              
              <div className="p-5 border-2 border-blue-100 bg-[var(--neo-primary)]/10/50 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--neo-primary)] text-white rounded-xl flex items-center justify-center font-bold">M</div>
                    <div>
                      <h3 className="font-bold text-[var(--neo-text-main)]">درگاه پرداخت آزمایشی (Mock)</h3>
                      <p className="text-xs text-[var(--neo-text-secondary)]">مخصوص محیط توسعه و تست</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.mockGatewayEnabled !== false}
                      onChange={e => handleChange('mockGatewayEnabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[var(--neo-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--neo-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                  </label>
                </div>
              </div>

              <div className="p-5 border border-[var(--neo-border)] rounded-2xl space-y-4 opacity-70">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold">Z</div>
                    <div>
                      <h3 className="font-bold text-[var(--neo-text-main)]">درگاه زرین‌پال</h3>
                      <p className="text-xs text-[var(--neo-text-secondary)]">غیرفعال در محیط تستی</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">Merchant ID</label>
                  <input
                    type="text"
                    disabled
                    value="xxxx-xxxx-xxxx-xxxx"
                    className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl outline-none text-left font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SMS & Communications */}
          {activeTab === 'sms' && (
            <div className="p-8 space-y-6 animate-in fade-in">
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] mb-6">پیکربندی سامانه پیامکی</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--neo-text-main)]">ارائه‌دهنده پیامک</label>
                  <select
                    value={formData.smsProvider || 'mock'}
                    onChange={e => handleChange('smsProvider', e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none transition-all"
                  >
                    <option value="mock">آزمایشی (Log to Console)</option>
                    <option value="kavenegar">کاوه نگار (Kavenegar)</option>
                    <option value="ghasedak">قاصدک (Ghasedak)</option>
                  </select>
                </div>

                {formData.smsProvider !== 'mock' && (
                  <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                    <label className="text-sm font-bold text-[var(--neo-text-main)]">API Key سامانه پیامکی</label>
                    <input
                      type="password"
                      value={formData.smsApiKey || ''}
                      onChange={e => handleChange('smsApiKey', e.target.value)}
                      className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none transition-all text-left font-mono"
                      dir="ltr"
                      placeholder="Enter API Key"
                    />
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)] text-sm">ارسال پیامک تایید ورود (OTP)</div>
                    <div className="text-xs text-[var(--neo-text-secondary)] mt-0.5">در صورت غیرفعال بودن، کد 12345 برای همه ثابت خواهد بود</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.requireOtp !== false}
                      onChange={e => handleChange('requireOtp', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-[var(--neo-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--neo-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--neo-primary)]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Legal / Rules */}
          {activeTab === 'legal' && (
            <div className="p-8 space-y-6 animate-in fade-in flex flex-col h-full min-h-[500px]">
              <h2 className="text-lg font-bold text-[var(--neo-text-main)] mb-6">قوانین و مقررات سایت</h2>
              
              <div className="flex-1 space-y-2">
                <label className="text-sm font-bold text-[var(--neo-text-main)]">متن قوانین سایت (Markdown/HTML)</label>
                <textarea
                  value={formData.termsAndConditions || ''}
                  onChange={e => handleChange('termsAndConditions', e.target.value)}
                  className="w-full h-64 px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                  placeholder="<h2>قوانین خرید دوره</h2><p>کاربر موظف است...</p>"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
