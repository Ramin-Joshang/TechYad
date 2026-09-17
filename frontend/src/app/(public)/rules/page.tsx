import Link from 'next/link';
import { Scale, BookOpen, ShieldAlert, CreditCard, Video, Users, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'قوانین و مقررات | تک‌یاد',
  description: 'قوانین و مقررات استفاده از خدمات و دوره‌های آموزشی پلتفرم تک‌یاد.',
};

export default function RulesPage() {
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
          {/* Last updated */}
          <div className="absolute top-8 left-8 text-xs font-medium text-[var(--neo-text-muted)] bg-[var(--neo-bg)] px-3 py-1.5 rounded-lg border border-[var(--neo-border)]">
            آخرین بروزرسانی: ۱۵ شهریور ۱۴۰۳
          </div>

          <div className="prose prose-blue prose-lg max-w-none prose-headings:text-[var(--neo-text-main)] prose-headings:font-bold prose-p:text-[var(--neo-text-secondary)] prose-p:leading-relaxed prose-li:text-[var(--neo-text-secondary)] mt-8">
            
            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                <BookOpen className="w-6 h-6 text-[var(--neo-primary)]" />
                ۱. قوانین کلی سایت
              </h2>
              <p>
                عضویت در سایت تک‌یاد و استفاده از خدمات آن به منزله مطالعه و پذیرش کامل این قوانین است. تک‌یاد حق دارد در هر زمان بدون اطلاع قبلی، این قوانین را تغییر دهد. نسخه به‌روزرسانی شده در همین صفحه قرار خواهد گرفت.
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
                <li>در صورت بروز اختلال در شبکه بانکی و کسر وجه، مبلغ طی ۷۲ ساعت کاری توسط بانک به حساب شما بازگردانده می‌شود.</li>
                <li>برای پرداخت‌های اقساطی، کاربر موظف به پرداخت سر موعد اقساط است. در غیر این صورت دسترسی به دوره موقتاً مسدود خواهد شد.</li>
              </ul>
            </section>

            <section className="mb-12 bg-[var(--neo-primary)]/5/50 p-6 rounded-2xl border border-blue-100">
              <h2 className="flex items-center gap-2 text-2xl border-b border-blue-200 pb-4 text-blue-900 mt-0">
                <ShieldAlert className="w-6 h-6 text-[var(--neo-primary)]" />
                ۳. قوانین استفاده از محتوا (کپی‌رایت)
              </h2>
              <p className="font-medium text-[var(--neo-text-main)]">
                محتوای آموزشی تک‌یاد حاصل تلاش اساتید و تیم تولید است. هرگونه سوءاستفاده از آن شرعاً و قانوناً حرام و ممنوع است.
              </p>
              <ul className="marker:text-red-500">
                <li><strong className="text-[var(--neo-text-main)]">اشتراک‌گذاری حساب ممنوع:</strong> هر حساب کاربری مختص یک نفر است. استفاده همزمان چند نفر از یک حساب موجب مسدود شدن دائم حساب بدون استرداد وجه خواهد شد.</li>
                <li><strong className="text-[var(--neo-text-main)]">انتشار محتوا ممنوع:</strong> دانلود، ضبط صفحه نمایش، کپی‌برداری، فروش یا انتشار رایگان ویدئوها و جزوات در شبکه‌های اجتماعی تلگرام و... پیگرد قانونی و قضایی شدید به همراه دارد.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                <Video className="w-6 h-6 text-[var(--neo-primary)]" />
                ۴. قوانین کلاس‌های آنلاین و دوره‌های ضبط‌ شده
              </h2>
              <ul>
                <li>دانشجو موظف است پیش از ثبت‌نام در کلاس‌های آنلاین، از داشتن اینترنت باثبات و سیستم مناسب اطمینان حاصل کند. قطعی اینترنت کاربر به عهده تک‌یاد نیست.</li>
                <li>رعایت شئونات اخلاقی در چت کلاس آنلاین الزامی است.</li>
                <li>دوره‌های ضبط شده لایسنس‌دار تنها روی سیستم عامل‌های ویندوز، مک و اندروید از طریق پلیر اختصاصی قابل مشاهده هستند.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl border-b border-[var(--neo-border)] pb-4">
                <Users className="w-6 h-6 text-[var(--neo-primary)]" />
                ۵. قوانین کلاس‌های حضوری
              </h2>
              <ul>
                <li>حضور به‌موقع در کلاس الزامی است (حداکثر تاخیر مجاز ۱۵ دقیقه).</li>
                <li>غیبت بیش از ۳ جلسه (غیرموجه) در دوره‌های حضوری، موجب حذف نام دانشجو از لیست دریافت گواهینامه پایان دوره می‌شود.</li>
                <li>رعایت پوشش مناسب محیط‌های آموزشی الزامی است.</li>
              </ul>
            </section>

            <section className="mb-12 bg-amber-50 p-6 rounded-2xl border border-amber-200">
              <h2 className="flex items-center gap-2 text-2xl border-b border-amber-200 pb-4 text-amber-900 mt-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                ۶. سیاست بازپرداخت و لغو (Refund Policy)
              </h2>
              <p>
                شرایط استرداد وجه با توجه به نوع دوره متفاوت است:
              </p>
              <ul>
                <li><strong className="text-[var(--neo-text-main)]">دوره‌های ویدئویی (ضبط شده):</strong> به دلیل دسترسی آنی به محتوا، امکان استرداد وجه پس از خرید وجود ندارد. (مگر در صورت اثبات خرابی فایل‌ها از سمت سرور ما).</li>
                <li><strong className="text-[var(--neo-text-main)]">کلاس‌های آنلاین و حضوری:</strong>
                  <ul>
                    <li>تا <strong className="text-red-600">۴۸ ساعت قبل از شروع اولین جلسه</strong>: لغو ثبت‌نام با کسر ۱۰٪ کارمزد.</li>
                    <li>از ۴۸ ساعت قبل تا <strong className="text-red-600">پایان جلسه اول</strong>: لغو ثبت‌نام با کسر ۳۰٪ مبلغ کل دوره.</li>
                    <li><strong className="text-red-600">پس از شروع جلسه دوم</strong>: امکان لغو و استرداد وجه تحت هیچ شرایطی وجود ندارد.</li>
                  </ul>
                </li>
                <li>مهلت واریز وجه استردادی توسط بخش مالی بین ۳ تا ۵ روز کاری می‌باشد.</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--neo-border)] text-center">
            <p className="text-[var(--neo-text-muted)] mb-4">
              برای اطلاعات بیشتر در مورد نحوه نگهداری اطلاعات شما، لطفاً صفحه حریم خصوصی را مطالعه کنید.
            </p>
            <Link href="/privacy" className="text-[var(--neo-primary)] font-bold hover:underline">
              مطالعه سیاست حفظ حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
