import Link from 'next/link';
import { Shield, Eye, Lock, FileText, Database } from 'lucide-react';

export const metadata = {
  title: 'حریم خصوصی | تک‌یاد',
  description: 'سیاست حفظ حریم خصوصی کاربران در پلتفرم آموزشی تک‌یاد.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">حریم خصوصی کاربران</h1>
          <p className="text-lg text-gray-600">
            حفظ امنیت و حریم خصوصی شما اولویت اصلی ما در تک‌یاد است.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative">
          {/* Last updated */}
          <div className="absolute top-8 left-8 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            آخرین بروزرسانی: ۱۵ شهریور ۱۴۰۳
          </div>

          <div className="prose prose-blue prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 mt-8">
            
            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl border-b border-gray-100 pb-4">
                <Eye className="w-6 h-6 text-blue-600" />
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
              <h2 className="flex items-center gap-2 text-2xl border-b border-gray-100 pb-4">
                <Database className="w-6 h-6 text-blue-600" />
                نحوه استفاده از اطلاعات
              </h2>
              <p>
                اطلاعات شما صرفاً جهت بهبود کیفیت خدمات، ارائه پشتیبانی بهتر و شخصی‌سازی تجربه کاربری استفاده می‌شود. تک‌یاد از اطلاعات شما برای موارد زیر استفاده می‌کند:
              </p>
              <ul>
                <li>ایجاد حساب کاربری و احراز هویت.</li>
                <li>ارسال اطلاع‌رسانی‌های مهم مربوط به کلاس‌ها و دوره‌ها.</li>
                <li>پاسخگویی به درخواست‌های پشتیبانی.</li>
                <li>جلوگیری از تقلب و سوءاستفاده از سیستم (مانند اشتراک‌گذاری اکانت).</li>
              </ul>
            </section>

            <section className="mb-12 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h2 className="flex items-center gap-2 text-2xl border-b border-blue-200 pb-4 text-blue-900 mt-0">
                <Lock className="w-6 h-6 text-blue-600" />
                امنیت اطلاعات شما
              </h2>
              <p className="font-medium text-gray-800">
                ما متعهد به حفظ امنیت کامل اطلاعات شما هستیم.
              </p>
              <ul className="">
                <li>تمامی ارتباطات بین مرورگر شما و سرورهای تک‌یاد توسط پروتکل SSL رمزنگاری می‌شود.</li>
                <li>گذرواژه‌های شما به صورت یک‌طرفه هش (Hash) شده و ما هیچ‌گونه دسترسی به متن خام آن‌ها نداریم.</li>
                <li>تک‌یاد هرگز اطلاعات شما را به شخص ثالث یا شرکت‌های تبلیغاتی نخواهد فروخت.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl border-b border-gray-100 pb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                تغییرات در سیاست حریم خصوصی
              </h2>
              <p>
                تک‌یاد حق دارد در صورت نیاز تغییراتی در این صفحه اعمال کند. هرگونه تغییر در سیاست‌های حریم خصوصی از طریق ایمیل یا اعلان در سایت به اطلاع شما خواهد رسید و ادامه استفاده شما از پلتفرم به منزله پذیرش این تغییرات است.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-4">
              در صورت وجود هرگونه سوال درباره سیاست حفظ حریم خصوصی، می‌توانید با تیم پشتیبانی در تماس باشید.
            </p>
            <Link href="/contact" className="text-blue-600 font-bold hover:underline">
              ارتباط با پشتیبانی
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
