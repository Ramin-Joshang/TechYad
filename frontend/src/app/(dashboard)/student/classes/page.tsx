'use client';

import { useQuery } from '@tanstack/react-query';
import { classesApi } from '@/features/learning/api/classes.api';
import { Video, Calendar, Clock, MapPin, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MyClassesPage() {
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => classesApi.getMyClasses().then(res => res.data)
  });

  const classes = classesData || [];

  const handleJoin = async (classId: string) => {
    try {
      setJoiningId(classId);
      const res = await classesApi.joinClass(classId);
      if (res.data?.meetingUrl) window.open(res.data.meetingUrl, "_blank");
    } catch (err) {
      alert("خطا در دریافت لینک ورود");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Video className="w-8 h-8 text-emerald-600" />
            کلاس‌های من
          </h1>
          <p className="text-gray-500">مدیریت کلاس‌های آنلاین و حضوری شما.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری کلاس‌ها...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">کلاسی یافت نشد</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">شما هنوز در هیچ کلاس آنلاین یا حضوری ثبت‌نام نکرده‌اید.</p>
          <Link href="/classes" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
            مشاهده کلاس‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((c: any) => {
            const classInfo = c.classId || c; // Depending on how the backend returns enrollments vs class models
            if (!classInfo) return null;

            const isOnline = classInfo.mode === 'online';
            
            return (
              <div key={classInfo._id || c._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row">
                <div className="sm:w-48 bg-gray-100 relative">
                  <img src={classInfo.thumbnail || `https://picsum.photos/seed/${classInfo._id}/400/400`} alt={classInfo.title} className="w-full h-full object-cover aspect-video sm:aspect-auto" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-gray-900 shadow-sm">
                    {isOnline ? 'آنلاین' : 'حضوری'}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 line-clamp-2" title={classInfo.title}>
                    {classInfo.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span>{classInfo.schedule || 'زمان‌بندی نشده'}</span>
                    </div>
                    {isOnline ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Video className="w-4 h-4 text-emerald-500" />
                        <span>پلتفرم آنلاین اختصاصی</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="line-clamp-1">{classInfo.location || 'محل برگزاری مشخص نشده'}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isOnline ? (
                      <button 
                        onClick={() => handleJoin(classInfo._id)}
                        disabled={joiningId === classInfo._id}
                        className="flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-bold hover:bg-emerald-100 transition disabled:opacity-50">
                        {joiningId === classInfo._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                        {joiningId === classInfo._id ? 'در حال اتصال...' : 'ورود به کلاس'}
                      </button>
                    ) : (
                      <Link href={`/classes/${classInfo.slug || classInfo._id}`} className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition">
                        مشاهده اطلاعات کلاس
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
