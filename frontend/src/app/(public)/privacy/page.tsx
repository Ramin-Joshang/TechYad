'use client';

import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import Link from 'next/link';
import { Shield, Eye, Lock, FileText, Database } from 'lucide-react';

export default function PrivacyPage() {
  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => superAdminApi.getPublicSettings().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const customPrivacy = publicSettings?.privacyPolicy;

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--neo-text-main)] mb-4">حریم خصوصی کاربران</h1>
          <p className="text-lg text-[var(--neo-text-secondary)]">
            حفظ امنیت و حریم خصوصی شما اولویت اصلی ما در تک‌یاد است.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[var(--neo-border)] relative">
          <div className="absolute top-8 left-8 text-xs font-medium text-[var(--neo-text-muted)] bg-[var(--neo-bg)] px-3 py-1.5 rounded-lg border border-[var(--neo-border)]">
            بیانیه رسمی حریم خصوصی
          </div>

          {customPrivacy ? (
            <div className="mt-8 space-y-6">
              <div className="p-6 bg-blue-50/40 border border-blue-100 rounded-2xl">
                <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
                  <FileText className="w-5 h-5" />
                  شیوه‌نامه مصوب حفظ حریم خصوصی
                </div>
                <div className="text-sm text-gray-700 leading-loose whitespace-pre-wrap font-sans">
                  {customPrivacy}
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-blue prose-lg max-w-none prose-headings:text-[var(--neo-text-main)] prose-headings:font-bold prose-p:text-[var(--neo-text-secondary)] prose-p:leading-relaxed prose-li:text-[var(--neo-text-secondary)] mt-8">
              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                  <Eye className="w-6 h-6 text-[var(--neo-primary)]" />
                  چه اطلاعاتی از شما دریافت می‌شود؟
                </h2>
                <p>
                  هنگام ثبت‌نام و استفاده از پلتفرم تک‌یاد، اطلاعات زیر از شما دریافت می‌گردد:
                </p>
                <ul>
                  <li>اطلاعات هویتی پایه: نام، نام خانوادگی، شماره موبایل و آدرس ایمیل.</li>
                  <li>اطلاعات آموزشی: سوابق تحصیلی، دوره‌های خریداری شده، نمرات و پیشرفت تحصیلی.</li>
                  <li>اطلاعات فنی: آدرس IP، نوع مرورگر، سیستم عامل و لاگ‌های دسترسی به منظور بهبود امنیت.</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                  <Database className="w-6 h-6 text-[var(--neo-primary)]" />
                  نحوه استفاده از اطلاعات
                </h2>
                <p>
                  اطلاعات شما صرفاً جهت بهبود کیفیت خدمات، ارائه پشتیبانی بهتر و شخصی‌سازی تجربه کاربری استفاده می‌شود:
                </p>
                <ul>
                  <li>ایجاد حساب کاربری و احراز هویت امن.</li>
                  <li>ارسال اطلاع‌رسانی‌های مهم مربوط به کلاس‌ها و دوره‌ها.</li>
                  <li>پاسخگویی به درخواست‌های پشتیبانی و رفع اشکال.</li>
                  <li>جلوگیری از تقلب و سوءاستفاده از سیستم (مانند اشتراک‌گذاری اکانت).</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                  <Lock className="w-6 h-6 text-[var(--neo-primary)]" />
                  امنیت داده‌ها
                </h2>
                <p>
                  تمامی گذرواژه‌ها به صورت یک‌طرفه و رمزنگاری‌شده (Hash) در دیتابیس ذخیره می‌شوند و حتی پرسنل تک‌یاد به رمز عبور شما دسترسی ندارند. همچنین کلیه تراکنش‌های بانکی در محیط امن شاپرک انجام می‌شود.
                </p>
              </section>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-[var(--neo-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--neo-text-muted)]">
              برای کسب اطلاعات بیشتر می‌توانید با تیم پشتیبانی در ارتباط باشید.
            </p>
            <Link
              href="/contact"
              className="text-sm font-bold text-[var(--neo-primary)] hover:underline"
            >
              تماس با ما &larr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
