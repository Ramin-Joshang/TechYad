'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Loader2, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Edit, 
  Filter, 
  GraduationCap, 
  ShoppingBag, 
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Clock,
  Shield,
  Plus,
  X,
  Lock,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'super-admin';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Add User State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    roleSlug: 'student',
    status: 'active',
    specialty: '',
    bio: '',
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.createUser(data),
    onSuccess: () => {
      toast.success('کاربر جدید با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setIsAddUserModalOpen(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        password: '',
        roleSlug: 'student',
        status: 'active',
        specialty: '',
        bio: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کاربر');
    }
  });
  
  const { data: usersData, isLoading } = useQuery({
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
          ? 'حساب کاربر با موفقیت فعال شد' 
          : 'حساب کاربر با موفقیت مسدود شد'
      );
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت کاربر');
    },
    onSettled: () => {
      setUpdatingUserId(null);
    }
  });

  const users = usersData || [];

  // Statistics calculation
  const stats = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter((u: any) => u.status === 'active').length;
    const blockedCount = users.filter((u: any) => u.status === 'blocked').length;
    const studentsCount = users.filter((u: any) => (u.role?.slug || u.role) === 'student').length;
    const totalRevenue = users.reduce((sum: number, u: any) => sum + (u.totalSpent || 0), 0);
    return { total, activeCount, blockedCount, studentsCount, totalRevenue };
  }, [users]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const mobile = (u.mobile || '').toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase()) || 
                            email.includes(search.toLowerCase()) ||
                            mobile.includes(search.toLowerCase());
      
      const roleSlug = u.role?.slug || u.role;
      const matchesRole = roleFilter === 'all' || roleSlug === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roleMap = new Map<string, string>();
    users.forEach((u: any) => {
      if (u.role) {
        const slug = u.role?.slug || u.role;
        const name = u.role?.name || slug;
        if (slug) roleMap.set(slug, name);
      }
    });
    return Array.from(roleMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [users]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-[var(--neo-primary)] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیریت اعضا و کاربران</h1>
            <p className="text-[var(--neo-text-secondary)] text-sm mt-1">مشاهده مشخصات کامل، سوابق آموزشی، مالی و کنترل دسترسی‌ها</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن کاربر جدید</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">کل کاربران ثبت‌نامی</span>
            <div className="text-2xl font-black text-[var(--neo-text-main)] mt-1.5">{stats.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[var(--neo-primary)]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">کاربران فعال</span>
            <div className="text-2xl font-black text-emerald-600 mt-1.5">{stats.activeCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">دانشجویان فعال</span>
            <div className="text-2xl font-black text-indigo-600 mt-1.5">{stats.studentsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">گردش مالی کاربران</span>
            <div className="text-xl font-black text-[var(--neo-text-main)] mt-1.5">
              {stats.totalRevenue.toLocaleString('fa-IR')} <span className="text-xs font-medium text-[var(--neo-text-secondary)]">تومان</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی کاربر با نام، ایمیل یا شماره تماس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)]/20 focus:border-[var(--neo-primary)] outline-none transition-all text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--neo-text-secondary)]">نقش:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
            >
              <option value="all">همه نقش‌ها</option>
              {uniqueRoles.map(r => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--neo-text-secondary)]">وضعیت:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[var(--neo-primary)]/20"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="blocked">مسدود</option>
              <option value="pending">در انتظار</option>
            </select>
          </div>

          {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="px-3 py-2 text-xs text-[var(--neo-text-secondary)] hover:text-rose-600 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" />
            <span className="text-xs text-[var(--neo-text-secondary)]">در حال بارگذاری مشخصات کاربران...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[var(--neo-surface-2)] rounded-2xl flex items-center justify-center text-[var(--neo-text-muted)] mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-1">کاربری یافت نشد</h3>
            <p className="text-xs text-[var(--neo-text-secondary)]">موردی متناسب با فیلترها یا عبارت جستجو پیدا نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">مشخصات کاربر</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">اطلاعات تماس</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">نقش کاربری</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">فعالیت آموزشی / خرید</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs">وضعیت حساب</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-xs text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredUsers.map((user: any) => {
                  const isUpdating = updatingUserId === user._id;
                  const roleSlug = user.role?.slug || user.role;
                  const roleName = user.role?.name || (
                    roleSlug === 'super-admin' ? 'مدیر کل' :
                    roleSlug === 'admin' ? 'مدیر' :
                    roleSlug === 'instructor' ? 'مدرس' :
                    roleSlug === 'student' ? 'دانشجو' : 'کاربر عادی'
                  );

                  return (
                    <tr key={user._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                      {/* User Avatar & Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold overflow-hidden shrink-0 border border-blue-200">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              user.firstName?.charAt(0) || 'U'
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

                      {/* Contact Info */}
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

                      {/* Role */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          roleSlug === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                          roleSlug === 'admin' ? 'bg-blue-100 text-blue-700' :
                          roleSlug === 'instructor' ? 'bg-amber-100 text-amber-800' :
                          'bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]'
                        }`}>
                          {roleSlug === 'super-admin' && <Shield className="w-3 h-3" />}
                          {roleName}
                        </span>
                      </td>

                      {/* Learning & Purchase Activity */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-xs text-[var(--neo-text-secondary)] flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                            <span>{user.enrollmentsCount || 0} دوره ثبت‌نام شده</span>
                          </div>
                          <div className="text-xs text-[var(--neo-text-muted)] flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              {(user.totalSpent || 0).toLocaleString('fa-IR')} تومان ({user.ordersCount || 0} سفارش)
                            </span>
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

                      {/* Actions with Loading State */}
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* Edit Button */}
                          <Link 
                            href={`/admin/users/${user._id}`} 
                            className="p-2 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-xl transition-colors" 
                            title="مشاهده و ویرایش مشخصات"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Status Toggle Button with Instant Spinner */}
                          {user.status !== 'blocked' ? (
                            <button 
                              onClick={() => updateStatusMutation.mutate({ id: user._id, status: 'blocked' })}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                              title="مسدود کردن کاربر"
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
                              title="فعال‌سازی کاربر"
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

      {/* Modal: Add User (افزودن کاربر جدید) */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--neo-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[var(--neo-text-main)]">افزودن کاربر جدید</h2>
                  <p className="text-xs text-[var(--neo-text-secondary)]">ثبت مستقیم کاربر با نقش سازمانی و اعتبارسنجی خودکار</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-xl text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate(newUserForm);
              }}
              className="space-y-4 text-right"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    نام <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    placeholder="مثال: علی"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    placeholder="مثال: محمدی"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    شماره موبایل <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={newUserForm.mobile}
                    onChange={(e) => setNewUserForm({ ...newUserForm, mobile: e.target.value })}
                    placeholder="09121234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@tecyad.ir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  رمز عبور موقت / رمز اولیه <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="حداقل ۶ کاراکتر"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                  <Lock className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-[var(--neo-text-muted)] mt-1">
                  رمز عبور با الگوریتم Argon2 به صورت کاملاً امن هش و ذخیره خواهد شد.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    نقش کاربری (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserForm.roleSlug}
                    onChange={(e) => setNewUserForm({ ...newUserForm, roleSlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] font-bold cursor-pointer"
                  >
                    <option value="student">🎓 دانشجو (Student)</option>
                    <option value="instructor">👨‍🏫 مدرس / استاد (Instructor)</option>
                    <option value="admin">🛡️ مدیر (Admin)</option>
                    <option value="support">🎧 پشتیبان (Support)</option>
                    {isSuperAdmin && (
                      <option value="super-admin">👑 مدیر کل (Super Admin)</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    وضعیت حساب
                  </label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] font-bold cursor-pointer"
                  >
                    <option value="active">فعال (آماده ورود و استفاده)</option>
                    <option value="pending">در انتظار تایید</option>
                  </select>
                </div>
              </div>

              {/* Instructor specific fields */}
              {newUserForm.roleSlug === 'instructor' && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-indigo-900 block">مشخصات پروفایل استاد</span>
                  <div>
                    <label className="block text-[11px] font-medium text-indigo-950 mb-1">
                      حوزه تخصصی و عنوان تدریس
                    </label>
                    <input
                      type="text"
                      value={newUserForm.specialty}
                      onChange={(e) => setNewUserForm({ ...newUserForm, specialty: e.target.value })}
                      placeholder="مثال: متخصص React و معماری فرانت‌اند"
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-[var(--neo-text-main)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-indigo-950 mb-1">
                      معرفی کوتاه (بیوگرافی)
                    </label>
                    <textarea
                      rows={2}
                      value={newUserForm.bio}
                      onChange={(e) => setNewUserForm({ ...newUserForm, bio: e.target.value })}
                      placeholder="سوابق کاری و تجربیات آموزشی استاد..."
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-[var(--neo-text-main)] resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--neo-border)]">
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs sm:text-sm font-bold hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {createUserMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>ایجاد حساب کاربر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] text-xs sm:text-sm font-bold hover:bg-[var(--neo-border)] transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
