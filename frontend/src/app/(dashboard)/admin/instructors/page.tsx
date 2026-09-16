'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, Briefcase } from 'lucide-react';

export default function AdminInstructorsPage() {
  const [search, setSearch] = useState('');
  
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then(res => res.data?.data)
  });

  const users = usersData || [];
  const instructors = users.filter((u: any) => {
    const roleSlug = u.role?.slug || u.role;
    return roleSlug === 'instructor';
  });

  const filteredInstructors = instructors.filter((u: any) => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Briefcase className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">اساتید</h1>
            <p className="text-gray-500 mt-1">مدیریت اساتید سیستم</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی استاد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-600 text-sm">استاد</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">ایمیل</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">تخصص</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((user: any) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="font-bold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-medium dir-ltr text-right">{user.email}</td>
                    <td className="p-4 text-gray-600 font-medium">{user.bio?.substring(0, 50) || 'مشخص نشده'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {user.status === 'active' ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
