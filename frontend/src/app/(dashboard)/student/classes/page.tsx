'use client';

import { useQuery } from '@tanstack/react-query';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  Video, Calendar, Clock, MapPin, ExternalLink, Loader2, 
  Users, CheckCircle2, AlertCircle, FileText, Sparkles, 
  Search, X, Download, Radio, ShieldCheck, Share2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export default function MyClassesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'in_person' | 'upcoming' | 'completed'>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [selectedResourcesClass, setSelectedResourcesClass] = useState<any>(null);

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => classesApi.getMyClasses().then(res => res.data)
  });

  const classes: any[] = classesData || [];

  // Metrics
  const stats = useMemo(() => {
    const total = classes.length;
    const now = new Date();
    const online = classes.filter(c => c.mode === 'online').length;
    const inPerson = classes.filter(c => c.mode === 'in_person' || c.mode === 'in-person').length;
    const upcoming = classes.filter(c => new Date(c.endDate || c.startDate || now) >= now).length;
    const completed = classes.filter(c => new Date(c.endDate || c.startDate || now) < now || c.status === 'completed').length;

    return { total, online, inPerson, upcoming, completed };
  }, [classes]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    const now = new Date();
    return classes.filter((c: any) => {
      const titleMatch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructors?.[0]?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructors?.[0]?.lastName?.toLowerCase().includes(search.toLowerCase());

      if (!titleMatch) return false;

      const isOnline = c.mode === 'online';
      const isPast = new Date(c.endDate || c.startDate || now) < now || c.status === 'completed';

      if (activeTab === 'online') return isOnline;
      if (activeTab === 'in_person') return !isOnline;
      if (activeTab === 'upcoming') return !isPast;
      if (activeTab === 'completed') return isPast;
      return true;
    });
  }, [classes, search, activeTab]);

  const handleJoin = async (classId: string, directLink?: string) => {
    try {
      setJoiningId(classId);
      const res = await classesApi.joinClass(classId);
      const url = res.data?.meetingUrl || directLink;
      if (url) {
        window.open(url, "_blank");
        toast.success('اتصال به کلاس آنلاین با موفقیت برقرار شد');
      } else {
        toast.error('لینک ورود به کلاس هنوز فعال نشده است');
      }
    } catch (err: any) {
      if (directLink) {
        window.open(directLink, "_blank");
      } else {
        toast.error(err.response?.data?.message || 'خطا در دریافت لینک ورود به کلاس');
      }
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>پنل دانشجو</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-semibold">کلاس‌های تعاملی</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Video className="w-8 h-8 text-emerald-600" />
            کلاس‌های من
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            مدیریت جلسات زنده آنلاین، کارگاه‌های حضوری، زمان‌بندی و دریافت منابع آموزشی اختصاصی.
          </p>
        </div>

        <Link
          href="/classes"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          ثبت‌نام در وبینارهای جدید
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>کل کلاس‌های ثبت‌نامی</span>
            <Video className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">کلاس</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>کلاس‌های فعال و پیش‌رو</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600">{stats.upcoming.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">جلسه</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>کلاس‌های آنلاین تعاملی</span>
            <Radio className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.online.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">وبینار</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>کارگاه‌های حضوری</span>
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{stats.inPerson.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">رویداد</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            همه کلاس‌ها ({stats.total.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            فعال و پیش‌رو ({stats.upcoming.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('online')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'online'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            آنلاین ({stats.online.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('in_person')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'in_person'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            حضوری ({stats.inPerson.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            پایان‌یافته ({stats.completed.toLocaleString('fa-IR')})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی نام کلاس یا استاد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-slate-600 text-sm font-medium">در حال بارگذاری کلاس‌های شما...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6">
            <Video className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {search ? 'کلاسی با این مشخصات یافت نشد' : 'در این بخش کلاسی ثبت نشده است'}
          </h3>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            {search
              ? 'لطفاً عبارت جستجو را تغییر دهید یا فیلترهای دیگر را بررسی فرمایید.'
              : 'شما در این گروه کلاسی ندارید. برای شرکت در کارگاه‌های زنده و وبینارهای تخصصی به بخش کاتالوگ کلاس‌ها مراجعه کنید.'}
          </p>
          <Link
            href="/classes"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-bold text-sm transition shadow-sm"
          >
            مشاهده تقویم و ثبت‌نام در کلاس‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.map((cls: any) => {
            const isOnline = cls.mode === 'online';
            const instructor = cls.instructors?.[0];
            const instructorName = instructor 
              ? `${instructor.firstName} ${instructor.lastName}` 
              : 'مدرس تک‌یاد';

            const startDate = cls.startDate ? new Date(cls.startDate) : null;
            const endDate = cls.endDate ? new Date(cls.endDate) : null;
            const now = new Date();
            const isPast = endDate ? endDate < now : cls.status === 'completed';
            const isLiveNow = startDate && endDate ? (startDate <= now && now <= endDate) : false;

            return (
              <div 
                key={cls._id || cls.enrollmentId} 
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row group"
              >
                {/* Thumbnail & Mode */}
                <div className="sm:w-56 bg-slate-100 relative shrink-0 overflow-hidden">
                  <img 
                    src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/400`} 
                    alt={cls.title} 
                    className="w-full h-full object-cover aspect-video sm:aspect-auto group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />
                  
                  {/* Mode Badge */}
                  <div className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-md text-white bg-black/50">
                    {isOnline ? 'وبینار آنلاین' : 'کارگاه حضوری'}
                  </div>

                  {/* Live Status indicator */}
                  {isLiveNow && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      در حال برگزاری
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Instructor unboxed text */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <img 
                        src={instructor?.avatar || `https://ui-avatars.com/api/?name=${instructorName}&size=32`} 
                        alt={instructorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{instructorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>ظرفیت: {cls.capacity || 50} نفر</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 leading-snug">
                      <Link href={`/classes/${cls.slug || cls._id}`}>
                        {cls.title}
                      </Link>
                    </h3>
                  </div>

                  {/* Schedule & Location */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        تاریخ برگزاری: {startDate ? startDate.toLocaleDateString('fa-IR') : 'مشخص نشده'}
                        {startDate && (
                          <span className="mr-1 text-slate-500 font-mono">
                            (ساعت {startDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </span>
                    </div>

                    {isOnline ? (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>پلتفرم اسکای‌روم / وبینار اختصاصی تک‌یاد</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{cls.location || 'محل برگزاری متعاقباً اعلام می‌شود'}</span>
                      </div>
                    )}

                    {cls.sessions && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>تعداد کل جلسات: <strong>{cls.sessions} جلسه</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>ثبت‌نام شده با کد: #{cls.enrollmentId ? cls.enrollmentId.slice(-6).toUpperCase() : 'CLS'}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    {isOnline ? (
                      <button
                        onClick={() => handleJoin(cls._id, cls.meetingLink)}
                        disabled={joiningId === cls._id}
                        className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm ${
                          isLiveNow
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {joiningId === cls._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        {isLiveNow ? 'ورود فوری به کلاس آنلاین' : 'ورود به محیط کلاس'}
                      </button>
                    ) : (
                      <Link
                        href={`/classes/${cls.slug || cls._id}`}
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
                      >
                        <MapPin className="w-4 h-4 text-amber-600" />
                        مشاهده جزئیات و آدرس
                      </Link>
                    )}

                    <button
                      onClick={() => setSelectedResourcesClass(cls)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      جزوات و منابع
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resources & Handouts Modal */}
      {selectedResourcesClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">منابع و فایل‌های کلاس</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedResourcesClass.title}</p>
              </div>
              <button
                onClick={() => setSelectedResourcesClass(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">اسلایدها و خلاصه مباحث تدریس</h4>
                    <span className="text-xs text-slate-500">نسخه PDF ویرایش شده توسط استاد</span>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success('دانلود فایل آغاز شد')}
                  className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-emerald-600 transition"
                  title="دانلود فایل"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">آرشیو ویدیویی و بازپخش جلسات</h4>
                    <span className="text-xs text-slate-500">کیفیت ۱۰۸۰p با سرور داخلی و نیم‌بها</span>
                  </div>
                </div>
                <button 
                  onClick={() => toast.success('لینک مشاهده ویدیو باز شد')}
                  className="p-2 hover:bg-white rounded-lg text-slate-600 hover:text-blue-600 transition"
                  title="مشاهده بازپخش"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedResourcesClass(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
