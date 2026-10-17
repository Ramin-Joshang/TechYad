import Link from "next/link";
import { Search, Play, BookOpen, Users } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-50 blur-3xl opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              پلتفرم جامع آموزش آنلاین و حضوری
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.3] mb-6">
              مهارت‌های جدید را با{" "}
              <span className="text-blue-600">بهترین اساتید</span> یاد بگیرید
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              تک یاد، کامل‌ترین پلتفرم آموزشی با امکان برگزاری کلاس‌های آنلاین،
              حضوری و دوره‌های ویدئویی در تمامی رشته‌های دانشگاهی و مهارتی.
              آینده شغلی خود را از امروز بسازید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/courses"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                جستجوی دوره‌ها
              </Link>
              <Link
                href="/classes"
                className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                آشنایی با تک یاد
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    +۵۰,۰۰۰
                  </div>
                  <div className="text-sm text-gray-500">دانشجو</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">+۱,۲۰۰</div>
                  <div className="text-sm text-gray-500">دوره آموزشی</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <img
                src="/hero-image.png"
                alt="دانشجویان و اساتید تک یاد"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-100 rounded-2xl -z-10 animate-[spin_10s_linear_infinite]" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-100 rounded-full -z-10" />

            <div className="absolute top-10 -left-10 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 z-20 animate-bounce">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  مدرک معتبر
                </div>
                <div className="text-xs text-gray-500">
                  مورد تایید وزارت علوم
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
