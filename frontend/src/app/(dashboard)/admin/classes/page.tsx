'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, Video, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminClassesPage() {
  const [search, setSearch] = useState('');
  
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: () => adminApi.getClasses().then(res => res.data?.data)
  });

  const classes = classesData?.classes || [];
  const filteredClasses = classes.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Video className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">کلاس‌های زنده و حضوری</h1>
            <p className="text-gray-500 mt-1">مشاهده و مدیریت کلاس‌های ایجاد شده در پلتفرم</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی کلاس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">
          کلاسی برای نمایش وجود ندارد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls: any) => (
            <div key={cls._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                <img src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/250`} alt={cls.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{cls.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.shortDescription || 'توضیحاتی ثبت نشده است'}</p>
                
                <div className="mt-auto space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium dir-ltr text-right">
                      {cls.startDate ? new Date(cls.startDate).toLocaleString('fa-IR') : 'نامشخص'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>ظرفیت: {cls.capacity || cls.maxStudents || 'نامحدود'} نفر</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                      {cls.instructors?.[0]?.firstName?.charAt(0) || 'U'}
                    </div>
                    <span>مدرس: {cls.instructors?.[0]?.firstName} {cls.instructors?.[0]?.lastName}</span>
                  </div>
                </div>
                
                <Link href={`/classes/${cls.slug || cls._id}`} className="w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors">
                  مشاهده صفحه کلاس
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
