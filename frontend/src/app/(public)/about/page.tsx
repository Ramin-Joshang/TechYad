'use client';

import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import Link from 'next/link';
import { Target, Eye, BookOpen, Users, Award, Shield, CheckCircle2, ChevronLeft, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => superAdminApi.getPublicSettings().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const title = publicSettings?.aboutTitle || 'یادگیری بهتر، آینده بهتر';
  const subtitle = publicSettings?.aboutSubtitle || 'ما در تک‌یاد معتقدیم آموزش باکیفیت حق همه است. پلتفرمی برای ارتقای مهارت‌های شما با بهترین اساتید ایران.';
  const story = publicSettings?.aboutStory || `تک‌یاد از یک ایده ساده شروع شد: "چگونه می‌توانیم آموزش تخصصی را برای دانش‌پذیران در سراسر کشور ساده‌تر و در دسترس‌تر کنیم؟" در سال‌های گذشته، بسیاری از دانشجویان به دلیل عدم دسترسی به اساتید مجرب یا هزینه‌های بالا از یادگیری جا می‌ماندند.

ما آموزشگاه تک‌یاد را راه‌اندازی کردیم تا با ترکیب تکنولوژی و آموزش، فضایی را خلق کنیم که هر کس، در هر جا و با هر امکاناتی بتواند مهارت‌های جدید بیاموزد و مسیر شغلی خود را متحول کند.`;
  const mission = publicSettings?.aboutMission || 'ارائه آموزش‌های عملی، باکیفیت و مقرون‌به‌صرفه در حوزه‌های تکنولوژی و مهندسی برای توانمندسازی نیروی کار فردا.';
  const vision = publicSettings?.aboutVision || 'تبدیل شدن به بزرگترین مرجع آموزش آنلاین و تعاملی در کشور و پر کردن شکاف بین دانشگاه و بازار کار.';

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/about/1920/1080')] opacity-10 mix-blend-overlay object-cover"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Story, Mission, Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[var(--neo-primary)]" />
                <span className="text-[var(--neo-primary)] font-bold tracking-widest text-xs uppercase">هویت و پیشینه ما</span>
              </div>
              <h2 className="text-3xl font-bold text-[var(--neo-text-main)] mb-6">داستان تک‌یاد</h2>
              <div className="text-lg text-[var(--neo-text-secondary)] leading-relaxed space-y-4 whitespace-pre-wrap">
                {story}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[var(--neo-primary)]/5 rounded-3xl p-8 border border-blue-100 flex flex-col justify-between">
                <div>
                  <Target className="w-12 h-12 text-[var(--neo-primary)] mb-6" />
                  <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-3">مأموریت ما</h3>
                  <p className="text-[var(--neo-text-secondary)] leading-relaxed text-sm">
                    {mission}
                  </p>
                </div>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col justify-between">
                <div>
                  <Eye className="w-12 h-12 text-emerald-600 mb-6" />
                  <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-3">چشم‌انداز ما</h3>
                  <p className="text-[var(--neo-text-secondary)] leading-relaxed text-sm">
                    {vision}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Areas */}
      <section className="py-20 bg-[var(--neo-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--neo-text-main)] mb-16">ارزش‌های بنیادین ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
              <Shield className="w-10 h-10 text-[var(--neo-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">کیفیت بدون سازش</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                تمام دوره‌ها توسط تیم نظارت آموزشی ارزیابی شده و بالاترین استانداردهای تدریس را دارا می‌باشند.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
              <Users className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">پشتیبانی و تعامل مستمر</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                یادگیری در تک‌یاد یک‌طرفه نیست؛ همراه با پرسش و پاسخ، بررسی تکالیف و پشتیبانی فعال اساتید است.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
              <Award className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">آموزش کاربردی و بازارمحور</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                تمرکز روی پروژه‌های واقعی و نیازهای روز صنایع تا دانشجو بلافاصله بتواند وارد بازار کار شود.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-[var(--neo-border)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">می‌خواهید عضوی از اساتید یا تیم تک‌یاد باشید؟</h2>
          <p className="text-gray-500 mb-8 text-sm">
            ما همیشه مشتاق همکاری با متخصصان و مدرسین باانگیزه هستیم.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/careers"
              className="px-6 py-3 bg-[var(--neo-primary)] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
            >
              مشاهده فرصت‌های همکاری و استخدام &larr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
