'use client';

import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import Link from 'next/link';
import { Scale, BookOpen, ShieldAlert, CreditCard, Video, Users, AlertCircle, FileText } from 'lucide-react';

export default function RulesPage() {
  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => superAdminApi.getPublicSettings().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const customRules = publicSettings?.termsOfService || publicSettings?.rules;

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] mb-6">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--neo-text-main)] mb-4">قوانین و مقررات</h1>
          <p className="text-lg text-[var(--neo-text-secondary)]">
            لطفاً پیش از ثبت‌نام و استفاده از خدمات تک‌یاد، این قوانین را به دقت مطالعه فرمایید.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[var(--neo-border)] relative">
          <div className="absolute top-8 left-8 text-xs font-medium text-[var(--neo-text-muted)] bg-[var(--neo-bg)] px-3 py-1.5 rounded-lg border border-[var(--neo-border)]">
            نسخه رسمی سامانه تک‌یاد
          </div>

          {customRules ? (
            <div className="mt-8 space-y-6">
              <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                  <FileText className="w-5 h-5" />
                  مقررات و شرایط عمومی مصوب مدیریت
                </div>
                <div className="text-sm text-gray-700 leading-loose whitespace-pre-wrap font-sans">
                  {customRules}
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-blue prose-lg max-w-none prose-headings:text-[var(--neo-text-main)] prose-headings:font-bold prose-p:text-[var(--neo-text-secondary)] prose-p:leading-relaxed prose-li:text-[var(--neo-text-secondary)] mt-8">
              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                  <BookOpen className="w-6 h-6 text-[var(--neo-primary)]" />
                  ۱. قوانین کلی سایت
                </h2>
                <p>
                  عضویت در سایت تک‌یاد و استفاده از خدمات آن به منزله مطالعه و پذیرش کامل این قوانین است. تک‌یاد حق دارد در هر زمان بدون اطلاع قبلی، این قوانین را تغییر دهد.
                </p>
                <ul>
                  <li>کاربر موظف است هنگام ثبت‌نام، اطلاعات هویتی و تماس خود را به صورت دقیق و واقعی وارد نماید.</li>
                  <li>مسئولیت حفظ و نگهداری از رمز عبور بر عهده کاربر است.</li>
                  <li>هرگونه فعالیت که موجب اختلال در عملکرد سایت شود، پیگرد قانونی خواهد داشت.</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                  <CreditCard className="w-6 h-6 text-[var(--neo-primary)]" />
                  ۲. قوانین خرید و پرداخت
                </h2>
                <p>
                  تمامی تراکنش‌های مالی از طریق درگاه‌های امن بانکی انجام می‌شود.
                </p>
                <ul>
                  <li>در صورت بروز اختلال در شبکه بانکی و کسر وجه، مبلغ طی ۷۲ ساعت کاری توسط بانک عودت داده می‌شود.</li>
                  <li>برای دوره‌ها و کلاس‌های پیش‌ثبت‌نامی (بیعانه)، پرداخت مابقی مبلغ طبق تقویم آموزشی الزامی است.</li>
                </ul>
              </section>

              <section className="mb-12 bg-amber-50/50 p-6 rounded-2xl border border-amber-200">
                <h2 className="flex items-center gap-2 text-2xl text-amber-800 border-none pb-0 mb-4">
                  <ShieldAlert className="w-6 h-6 text-amber-600" />
                  ۳. مالکیت فکری و حق کپی‌رایت
                </h2>
                <p className="text-amber-900 font-medium">
                  تمامی محتوای دوره‌ها، ویدیوها و جزوات آموزشی متعلق به مدرسین و تک‌یاد است.
                </p>
                <ul className="text-amber-800">
                  <li>هرگونه انتشار، بازنشر، فروش یا اشتراک‌گذاری محتوای آموزشی غیرقانونی و شرعاً و قانوناً ممنوع است.</li>
                  <li>هر حساب کاربری فقط مختص یک فرد است و استفاده همزمان چند نفر ممنوع است.</li>
                </ul>
              </section>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-[var(--neo-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--neo-text-muted)]">
              سوالی در مورد قوانین دارید؟ با پشتیبانی ما در ارتباط باشید.
            </p>
            <Link
              href="/contact"
              className="text-sm font-bold text-[var(--neo-primary)] hover:underline"
            >
              تماس با پشتیبانی &larr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
