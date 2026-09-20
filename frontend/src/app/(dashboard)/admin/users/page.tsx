'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, Shield, UserX, UserCheck, MoreVertical, Edit } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then(res => res.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => adminApi.updateUserStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });

  const users = usersData || [];
  const filteredUsers = users.filter((u: any) => 
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت کاربران</h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">نمایش و مدیریت تمام کاربران سیستم</p>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی کاربر با نام یا ایمیل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">کاربر</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">ایمیل</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">نقش</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">وضعیت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: any) => (
                  <tr key={user._id} className="border-b border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold overflow-hidden shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="font-bold text-[var(--neo-text-main)]">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--neo-text-secondary)] font-medium dir-ltr text-right">{user.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-md text-xs font-bold capitalize">
                        {user.role?.name || user.role || 'کاربر عادی'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'blocked' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status === 'active' ? 'فعال' : user.status === 'blocked' ? 'مسدود' : 'در انتظار'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link href={`/admin/users/${user._id}`} className="p-2 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {user.status !== 'blocked' ? (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: user._id, status: 'blocked' })}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="مسدود کردن"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: user._id, status: 'active' })}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="فعال کردن"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
