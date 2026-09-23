'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Loader2, 
  Search, 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'paying' | 'free'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  
  const { data: usersData, isLoading, isFetching } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.getUsers().then(res => res.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => {
      setUpdatingUserId(id);
      return adminApi.updateUserStatus(id, status);
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'active' 
          ? 'حساب دانشجو با موفقیت فعال شد' 
          : 'حساب دانشجو با موفقیت مسدود شد'
      );
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت دانشجو');
    },
    onSettled: () => {
      setUpdatingUserId(null);
    }
  });

  const users = usersData || [];

  // Filter only students (either explicit role 'student' or missing role)
  const students = useMemo(() => {
    return users.filter((u: any) => {
      const roleSlug = u.role?.slug || u.role;
      return !roleSlug || roleSlug === 'student';
    });
  }, [users]);

  // Statistics calculation for students
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s: any) => s.status === 'active').length;
    const blocked = students.filter((s: any) => s.status === 'blocked').length;
    const totalEnrollments = students.reduce((sum: number, s: any) => sum + (s.enrollmentsCount || 0), 0);
    const totalRevenue = students.reduce((sum: number, s: any) => sum + (s.totalSpent || 0), 0);
    const payingStudents = students.filter((s: any) => (s.ordersCount || 0) > 0 || (s.totalSpent || 0) > 0).length;
    
    return {
      total,
      active,
      blocked,
      totalEnrollments,
      totalRevenue,
      payingStudents
    };
  }, [students]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((u: any) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const mobile = (u.mobile || '').toLowerCase();
      const s = search.toLowerCase();

      const matchesSearch = !s || fullName.includes(s) || email.includes(s) || mobile.includes(s);
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesPurchase = purchaseFilter === 'all' || 
        (purchaseFilter === 'paying' ? (u.totalSpent > 0 || u.ordersCount > 0) : (!u.totalSpent && !u.ordersCount));

      return matchesSearch && matchesStatus && matchesPurchase;
    });
  }, [students, search, statusFilter, purchaseFilter]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--neo-surface)] border border-[var(--neo-border)] p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت پیشرفته دانشجویان</h1>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
              مشاهده سوابق ثبت‌نام، دوره‌های خریداری شده، مجموع پرداخت‌ها و مدیریت وضعیت دسترسی
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold mb-2">
            <span>کل دانشجویان</span>
            <GraduationCap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats.total.toLocaleString('fa-IR')}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.active.toLocaleString('fa-IR')} فعال • {stats.blocked.toLocaleString('fa-IR')} مسدود
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold mb-2">
            <span>دانشجویان خریدار</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.payingStudents.toLocaleString('fa-IR')}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.total > 0 ? `${Math.round((stats.payingStudents / stats.total) * 100)}% نرخ تبدیل به خریدار` : '-'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold mb-2">
            <span>مجموع دوره‌های ثبت‌نامی</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{stats.totalEnrollments.toLocaleString('fa-IR')}</div>
          <div className="text-[11px] text-gray-400 mt-1">
            میانگین {stats.total > 0 ? (stats.totalEnrollments / stats.total).toFixed(1) : 0} دوره برای هر دانشجو
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold mb-2">
            <span>ارزش خرید کل دانشجویان</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.totalRevenue.toLocaleString('fa-IR')} <span className="text-xs font-normal text-gray-400">تومان</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            میانگین {stats.payingStudents > 0 ? Math.round(stats.totalRevenue / stats.payingStudents).toLocaleString('fa-IR') : 0} تومان
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجوی نام، ایمیل، شماره موبایل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'all' ? 'bg-white shadow-xs font-bold text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              همه وضعیت‌ها
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'active' ? 'bg-white shadow-xs font-bold text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              فقط فعال
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-3 py-1.5 rounded-lg transition ${statusFilter === 'blocked' ? 'bg-white shadow-xs font-bold text-rose-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              مسدود شده
            </button>
          </div>

          {/* Purchase Filter */}
          <select
            value={purchaseFilter}
            onChange={(e) => setPurchaseFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none"
          >
            <option value="all">همه سوابق خرید</option>
            <option value="paying">دانشجویان خریدار (پرداخت‌دار)</option>
            <option value="free">ثبت‌نامی‌های رایگان / بدون سفارش</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden relative">
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-blue-600/10 backdrop-blur-xs py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 border-b border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            در حال بروزرسانی اطلاعات دانشجویان...
          </div>
        )}

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-9 h-9 animate-spin text-[var(--neo-primary)] mb-3" />
            <span className="text-sm font-bold text-gray-700">در حال بارگذاری اطلاعات دانشجویان...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-700">دانشجویی با این مشخصات یافت نشد.</p>
            <p className="text-xs text-gray-400 mt-1">فیلترها یا عبارت جستجو را تغییر دهید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold">
                  <th className="p-4">مشخصات دانشجو</th>
                  <th className="p-4">تماس و ارتباط</th>
                  <th className="p-4">دوره‌های فعال</th>
                  <th className="p-4">سفارشات و مجموع خرید</th>
                  <th className="p-4">تاریخ عضویت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((user: any) => {
                  const isBlocked = user.status === 'blocked';
                  const isUpdating = updatingUserId === user._id;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border border-blue-200">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              user.firstName?.charAt(0) || 'D'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-900">
                              {user.firstName || 'کاربر'} {user.lastName || ''}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <span>شناسه:</span>
                              <span className="font-mono">{user._id?.substring(user._id.length - 6)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-700 font-mono text-[11px] dir-ltr text-right">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{user.email || '-'}</span>
                          </div>
                          {user.mobile && (
                            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px] dir-ltr text-right">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Enrollments */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-indigo-700">
                              {(user.enrollmentsCount || 0).toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[11px] text-gray-400 mr-1">دوره</span>
                          </div>
                        </div>
                      </td>

                      {/* Orders & Spent */}
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-gray-900">
                            {(user.totalSpent || 0).toLocaleString('fa-IR')}{' '}
                            <span className="text-[10px] font-normal text-gray-400">تومان</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {(user.ordersCount || 0).toLocaleString('fa-IR')} سفارش موفق
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="p-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {user.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              فعال
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              مسدود شده
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active / Blocked */}
                          <button
                            onClick={() => updateStatusMutation.mutate({ 
                              id: user._id, 
                              status: isBlocked ? 'active' : 'blocked' 
                            })}
                            disabled={isUpdating}
                            title={isBlocked ? 'رفع مسدودی دانشجو' : 'مسدود کردن دانشجو'}
                            className={`p-2 rounded-xl transition ${
                              isBlocked 
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isBlocked ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </button>

                          {/* Full Profile & Enrollments Link */}
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                            title="مشاهده پروفایل جامع، دوره‌ها و تراکنش‌ها"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">جزئیات کامل</span>
                          </Link>
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
