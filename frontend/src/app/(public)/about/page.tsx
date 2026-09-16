import Link from 'next/link';
import { Target, Eye, BookOpen, Users, Award, Shield, CheckCircle2, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'درباره ما | تک‌یاد',
  description: 'داستان شکل‌گیری، مأموریت و چشم‌انداز آموزشگاه آنلاین تک‌یاد. با تیم ما آشنا شوید.',
};

export default function AboutPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/about/1920/1080')] opacity-10 mix-blend-overlay object-cover"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            یادگیری بهتر، <span className="text-blue-500">آینده بهتر</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            ما در تک‌یاد معتقدیم آموزش باکیفیت حق همه است. پلتفرمی برای ارتقای مهارت‌های شما با بهترین اساتید ایران.
          </p>
        </div>
      </section>

      {/* Story, Mission, Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">داستان ما</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                تک‌یاد از یک ایده ساده شروع شد: "چگونه می‌توانیم آموزش تخصصی را برای دانش‌پذیران در سراسر کشور ساده‌تر و در دسترس‌تر کنیم؟" در سال‌های گذشته، بسیاری از دانشجویان به دلیل عدم دسترسی به اساتید مجرب یا هزینه‌های بالا از یادگیری جا می‌ماندند.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                ما آموزشگاه تک‌یاد را راه‌اندازی کردیم تا با ترکیب تکنولوژی و آموزش، فضایی را خلق کنیم که هر کس، در هر جا و با هر امکاناتی بتواند مهارت‌های جدید بیاموزد و مسیر شغلی خود را متحول کند.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
                <Target className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">مأموریت ما</h3>
                <p className="text-gray-600 leading-relaxed">
                  ارائه آموزش‌های عملی، باکیفیت و مقرون‌به‌صرفه در حوزه‌های تکنولوژی و مهندسی برای توانمندسازی نیروی کار فردا.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
                <Eye className="w-12 h-12 text-emerald-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">چشم‌انداز ما</h3>
                <p className="text-gray-600 leading-relaxed">
                  تبدیل شدن به بزرگترین مرجع آموزش آنلاین و تعاملی در خاورمیانه و پر کردن شکاف بین دانشگاه و بازار کار.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Areas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">حوزه‌های آموزشی ما</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            تک‌یاد در رشته‌ها و تخصص‌های مختلفی دوره‌های جامع و پروژه‌محور ارائه می‌دهد.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['دانشگاهی', 'دانش‌آموزی', 'برنامه‌نویسی', 'برق', 'کامپیوتر', 'ریاضی', 'فیزیک', 'طراحی سایت', 'هوش مصنوعی', 'زبان انگلیسی'].map(area => (
              <span key={area} className="px-6 py-3 bg-white rounded-2xl shadow-sm text-gray-800 font-bold border border-gray-100 hover:border-blue-300 hover:shadow-md transition">
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us & Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-6">
              {[
                { icon: Users, title: '۱۰۰+', subtitle: 'دانشجو' },
                { icon: Award, title: '۲۰+', subtitle: 'استاد مجرب' },
                { icon: BookOpen, title: '۵۰+', subtitle: 'دوره آموزشی' },
                { icon: Shield, title: '۹۸٪', subtitle: 'رضایت کاربران' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-100">
                  <stat.icon className="w-10 h-10 mx-auto text-blue-600 mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.title}</div>
                  <div className="text-gray-500 font-medium">{stat.subtitle}</div>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">چرا تک‌یاد؟</h2>
              <ul className="space-y-4">
                {[
                  'اساتید متخصص و باسابقه از برترین دانشگاه‌ها',
                  'امکان شرکت در کلاس‌های حضوری و آنلاین',
                  'پروژه‌محور بودن تمام دوره‌های آموزشی',
                  'دسترسی دائمی به محتوای ضبط‌شده کلاس‌ها',
                  'دوره‌های رایگان برای شروع یادگیری',
                  'پشتیبانی قوی و رفع اشکال آنلاین'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">تیم بنیان‌گذاران</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {[
              { name: 'علی احمدی', role: 'مدیرعامل و هم‌بنیان‌گذار' },
              { name: 'سارا کریمی', role: 'مدیر آموزش و هم‌بنیان‌گذار' }
            ].map((member, idx) => (
              <div key={idx} className="text-center">
                <img 
                  src={`https://ui-avatars.com/api/?name=${member.name}&size=200&background=random`} 
                  alt={member.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto mb-4 shadow-lg border-4 border-white"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">آماده‌اید مسیر یادگیری را شروع کنید؟</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
          همین حالا به جمع دانشجویان تک‌یاد بپیوندید و با شرکت در دوره‌های ما، آینده شغلی خود را تضمین کنید.
        </p>
        <Link href="/courses" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-lg">
          مشاهده دوره‌های آموزشی
          <ChevronLeft className="w-5 h-5" />
        </Link>
      </section>
    </main>
  );
}
