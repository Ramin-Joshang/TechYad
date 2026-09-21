'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Loader2, 
  Search, 
  Briefcase, 
  Edit, 
  UserCheck, 
  UserX, 
  BookOpen, 
  Users, 
  Star, 
  Phone, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminInstructorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then(res => res.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      setUpdatingId(id);
      return adminApi.updateUserStatus(id, status);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'active' 
          ? 'وضعیت استاد به فعال تغییر یافت' 
          : 'حساب استاد با موفقیت مسدود شد'
      );
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت استاد');
    },
    onSettled: () => {
      setUpdatingId(null);
    }
  });

  const users = usersData || [];
  const instructors = useMemo(() => {
    return users.filter((u: any) => {
      const roleSlug = u.role?.slug || u.role;
      return roleSlug === 'instructor';
    });
  }, [users]);

  // Statistics calculation for instructors
  const stats = useMemo(() => {
    const total = instructors.length;
    const activeCount = instructors.filter((u: any) => u.status === 'active').length;
    const totalCourses = instructors.reduce((sum: number, u: any) => sum + (u.coursesCount || 0), 0);
    const totalStudents = instructors.reduce((sum: number, u: any) => 
      sum + (u.totalStudentsCount || u.instructorProfile?.totalStudents || 0), 0);
    return { total, activeCount, totalCourses, totalStudents };
  }, [instructors]);

  // Filtered instructors
  const filteredInstructors = useMemo(() => {
    return instructors.filter((u: any) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const mobile = (u.mobile || '').toLowerCase();
      const specialty = (u.specialty || u.instructorProfile?.title || '').toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) ||
                            email.includes(search.toLowerCase()) ||
                            mobile.includes(search.toLowerCase()) ||
                            specialty.includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [instructors, search, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیریت اساتید و مدرسین</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">مشاهده مشخصات، سوابق تدریس، دانشجویان و کنترل دسترسی اساتید</p>
          </div>
        </div>

        <Link
          href="/admin/users"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          ارتقا یا افزودن کاربر به استاد
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">کل اساتید ثبت‌شده</span>
            <div className="text-2xl font-black text-[var(--neo-text-main)] mt-1.5">{stats.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">اساتید فعال</span>
            <div className="text-2xl font-black text-emerald-600 mt-1.5">{stats.activeCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">مجموع دوره‌های تحت تدریس</span>
            <div className="text-2xl font-black text-indigo-600 mt-1.5">{stats.totalCourses}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">کل دانشجویان آموزش‌دیده</span>
            <div className="text-2xl font-black text-blue-600 mt-1.5">{stats.totalStudents.toLocaleString('fa-IR')}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی استاد با نام، ایمیل، موبایل یا تخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--neo-text-secondary)]">وضعیت:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="blocked">مسدود</option>
            <option value="pending">در انتظار تایید</option>
          </select>

          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-xs text-[var(--neo-text-secondary)] hover:text-rose-600 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" />
            <span className="text-xs text-[var(--neo-text-secondary)]">در حال بارگذاری لیست اساتید...</span>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[var(--neo-surface-2)] rounded-2xl flex items-center justify-center text-[var(--neo-text-muted)] mb-3">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-1">استادی یافت نشد</h3>
            <p className="text-xs text-[var(--neo-text-secondary)]">موردی متناسب با فیلترها یا عبارت جستجو پیدا نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">مشخصات استاد</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">اطلاعات تماس</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">عنوان و حوزه تخصصی</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">آمار آموزشی</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">وضعیت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredInstructors.map((user: any) => {
                  const isUpdating = updatingId === user._id;
                  const specialty = user.specialty || user.instructorProfile?.title || 'مدرس تک‌یاد';
                  const coursesCount = user.coursesCount || 0;
                  const studentsCount = user.totalStudentsCount || user.instructorProfile?.totalStudents || 0;
                  const rating = user.instructorProfile?.rating || 5;

                  return (
                    <tr key={user._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                      {/* Avatar & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border border-amber-200">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              user.firstName?.charAt(0) || 'I'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--neo-text-main)]">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-[11px] text-[var(--neo-text-muted)] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              عضویت: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-xs text-[var(--neo-text-secondary)] font-medium dir-ltr text-right flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[var(--neo-text-muted)] shrink-0" />
                            <span>{user.email || '---'}</span>
                          </div>
                          {user.mobile && (
                            <div className="text-xs text-[var(--neo-text-muted)] dir-ltr text-right flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[var(--neo-text-muted)] shrink-0" />
                              <span>{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Specialty & Bio */}
                      <td className="p-4 max-w-xs">
                        <div className="text-xs font-bold text-[var(--neo-text-main)] truncate">
                          {specialty}
                        </div>
                        <div className="text-[11px] text-[var(--neo-text-muted)] line-clamp-1 mt-0.5">
                          {user.bio || user.instructorProfile?.bio || 'توضیحات و بیوگرافی ثبت نشده است'}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-xs text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="font-bold">{coursesCount}</span> دوره فعال
                          </div>
                          <div className="text-xs text-[var(--neo-text-muted)] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            <span>{studentsCount.toLocaleString('fa-IR')} دانشجو</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          user.status === 'blocked' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {user.status === 'active' ? 'فعال' : user.status === 'blocked' ? 'مسدود' : 'در انتظار'}
                        </span>
                      </td>

                      {/* Operations */}
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* Edit Instructor Link */}
                          <Link 
                            href={`/admin/instructors/${user._id}`} 
                            className="p-2 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-xl transition-colors" 
                            title="ویرایش پرونده استاد"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Toggle Status with Loading Indicator */}
                          {user.status !== 'blocked' ? (
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: user._id, status: 'blocked' })}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="مسدود کردن دسترسی استاد"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: user._id, status: 'active' })}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="فعال‌سازی حساب استاد"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
