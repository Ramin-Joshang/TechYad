'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  ArrowRight, Loader2, Save, User, Mail, Phone, Lock, Shield, 
  CheckCircle2, AlertCircle, GraduationCap, ShoppingBag, CreditCard,
  Calendar, Briefcase, FileText, Star, Ticket, BookOpen, Video,
  ExternalLink, Clock, Layers, DollarSign, Check, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  role?: string;
  specialty?: string;
  bio?: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'orders' | 'tickets' | 'teaching' | 'edit'>('overview');

  // Fetch complete user details from the dedicated aggregation endpoint
  const { data: userDetails, isLoading, isError } = useQuery({
    queryKey: ['adminUserDetail', id],
    queryFn: async () => {
      const res = await adminApi.getUserById(id);
      return res.data?.data || res.data;
    }
  });

  const { data: rolesData } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: () => adminApi.getRoles().then((res: any) => res?.data || res).catch(() => [])
  });

  const user = userDetails?.user;
  const instructorProfile = userDetails?.instructorProfile;
  const enrollments = userDetails?.enrollments || [];
  const orders = userDetails?.orders || [];
  const tickets = userDetails?.tickets || [];
  const courses = userDetails?.courses || [];
  const classes = userDetails?.classes || [];
  const stats = userDetails?.stats || {};

  const roleName = user?.role?.name || user?.role?.slug || user?.role || 'کاربر عادی';
  const isInstructor = user?.role?.slug === 'instructor' || user?.role === 'instructor' || !!instructorProfile || courses.length > 0;

  // Form State for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    status: 'active',
    role: '',
    specialty: '',
    bio: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: '',
        status: user.status || 'active',
        role: user.role?._id || user.role || '',
        specialty: user.specialty || instructorProfile?.title || '',
        bio: user.bio || instructorProfile?.bio || '',
      });
    }
  }, [user, instructorProfile]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'نام الزامی است';
        if (value.trim().length < 2) return 'نام باید حداقل ۲ کاراکتر باشد';
        return undefined;
      case 'lastName':
        if (!value.trim()) return 'نام خانوادگی الزامی است';
        if (value.trim().length < 2) return 'نام خانوادگی باید حداقل ۲ کاراکتر باشد';
        return undefined;
      case 'email':
        if (!value.trim()) return 'ایمیل الزامی است';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'فرمت ایمیل نامعتبر است';
        return undefined;
      case 'mobile':
        if (value.trim() && !/^09\d{9}$/.test(value.trim())) {
          return 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
        }
        return undefined;
      case 'password':
        if (value && value.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const err = validateField(name, (formData as any)[name]);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('اطلاعات کاربر با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی کاربر');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: string) => adminApi.updateUser(id, { status: newStatus }),
    onSuccess: () => {
      toast.success('وضعیت کاربر با موفقیت تغییر کرد');
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, (formData as any)[key]);
      if (err) (newErrors as any)[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ firstName: true, lastName: true, email: true, mobile: true, password: true });
      toast.error('لطفاً خطاهای فرم را اصلاح فرمایید');
      return;
    }

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      status: formData.status,
      role: formData.role,
      specialty: formData.specialty,
      bio: formData.bio,
    };
    if (formData.password) payload.password = formData.password;

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
        <p className="text-sm font-bold text-[var(--neo-text-secondary)]">درحال دریافت پرونده کامل کاربر...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-[var(--neo-text-main)]">کاربر مورد نظر یافت نشد</h2>
        <p className="text-xs text-[var(--neo-text-secondary)]">ممکن است شناسه کاربر اشتباه باشد یا حساب کاربری حذف شده باشد.</p>
        <button onClick={() => router.back()} className="px-5 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl">
          بازگشت به فهرست کاربران
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      {/* Header Profile Banner */}
      <div className="bg-[var(--neo-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--neo-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-3 bg-[var(--neo-surface-2)] rounded-2xl hover:bg-[var(--neo-border)] transition text-[var(--neo-text-secondary)]"
            title="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden border-2 border-white/20">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` || 'U'
              )}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[var(--neo-text-main)]">
                {user.firstName} {user.lastName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {roleName}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {user.status === 'active' ? 'فعال' : 'غیرفعال / مسدود'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)] mt-1.5 flex-wrap">
              <span>ایمیل: {user.email}</span>
              {user.mobile && <span>موبایل: {user.mobile}</span>}
              <span>عضویت: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
            </div>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => toggleStatusMutation.mutate(user.status === 'active' ? 'inactive' : 'active')}
            disabled={toggleStatusMutation.isPending}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm ${
              user.status === 'active' 
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            {toggleStatusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.status === 'active' ? (
              <>
                <X className="w-4 h-4" /> غیرفعال‌سازی حساب
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> فعال‌سازی حساب
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">دوره‌های ثبت‌نامی</span>
          <h4 className="text-lg font-black text-blue-600 mt-0.5">{stats.totalEnrollments || enrollments.length}</h4>
        </div>
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">سفارشات ثبت شده</span>
          <h4 className="text-lg font-black text-emerald-600 mt-0.5">{stats.totalOrders || orders.length}</h4>
        </div>
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">مجموع پرداخت‌ها</span>
          <h4 className="text-sm font-black text-[var(--neo-text-main)] mt-1">{(stats.totalSpent || 0).toLocaleString()} ت</h4>
        </div>
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">تیکت‌های پشتیبانی</span>
          <h4 className="text-lg font-black text-amber-600 mt-0.5">{stats.totalTickets || tickets.length}</h4>
        </div>
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">دوره‌های تدریس</span>
          <h4 className="text-lg font-black text-purple-600 mt-0.5">{stats.totalCoursesCreated || courses.length}</h4>
        </div>
        <div className="bg-[var(--neo-surface)] p-3.5 rounded-2xl border border-[var(--neo-border)]">
          <span className="text-[11px] text-[var(--neo-text-secondary)] block font-medium">دانشجویان آموزش‌دیده</span>
          <h4 className="text-lg font-black text-indigo-600 mt-0.5">{stats.totalStudents || 0} نفر</h4>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--neo-border)] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> خلاصه پرونده و بیوگرافی
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'enrollments' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> دوره‌های دانشجو ({enrollments.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'orders' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> سفارشات و تراکنش‌ها ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'tickets' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" /> تیکت‌ها ({tickets.length})
        </button>

        {isInstructor && (
          <button
            onClick={() => setActiveTab('teaching')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'teaching' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> دوره‌ها و کلاس‌های تدریس ({courses.length + classes.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'edit' ? 'bg-[var(--neo-primary)] text-white' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          <Save className="w-3.5 h-3.5" /> ویرایش مشخصات کاربر
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] space-y-5">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">اطلاعات شناسنامه‌ای و حساب</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">نام کامل:</span>
                <span className="font-bold text-[var(--neo-text-main)]">{user.firstName} {user.lastName}</span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">پست الکترونیک:</span>
                <span className="font-bold text-[var(--neo-text-main)] dir-ltr text-right">{user.email}</span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">شماره تماس همراه:</span>
                <span className="font-bold text-[var(--neo-text-main)] dir-ltr text-right">{user.mobile || 'ثبت نشده'}</span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[var(--neo-text-secondary)] block mb-1">نقش دسترسی:</span>
                <span className="font-bold text-[var(--neo-text-main)]">{roleName}</span>
              </div>
            </div>

            {(user.bio || instructorProfile?.bio) && (
              <div>
                <h4 className="font-bold text-xs text-[var(--neo-text-main)] mb-1">بیوگرافی و شرح فعالیت:</h4>
                <p className="p-4 bg-[var(--neo-surface-2)] rounded-xl text-xs text-[var(--neo-text-secondary)] leading-relaxed">
                  {user.bio || instructorProfile?.bio}
                </p>
              </div>
            )}
          </div>

          <div className="bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">دسترسی‌های سریع</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('edit')}
                className="w-full py-2.5 px-4 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl text-xs font-bold text-right flex items-center justify-between transition"
              >
                <span>ویرایش اطلاعات و کلمه عبور</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
              <button
                onClick={() => setActiveTab('enrollments')}
                className="w-full py-2.5 px-4 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl text-xs font-bold text-right flex items-center justify-between transition"
              >
                <span>مشاهده دوره‌های ثبت‌نام شده</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="w-full py-2.5 px-4 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl text-xs font-bold text-right flex items-center justify-between transition"
              >
                <span>مشاهده تاریخچه تراکنش‌ها</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Enrollments */}
      {activeTab === 'enrollments' && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)]">دوره‌های ثبت‌نامی دانشجو</h3>
          {enrollments.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
              کاربر در هیچ دوره‌ای ثبت‌نام نکرده است.
            </div>
          ) : (
            <div className="divide-y divide-[var(--neo-border)]">
              {enrollments.map((enr: any) => {
                const c = enr.courseId;
                return (
                  <div key={enr._id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[var(--neo-text-main)]">
                          {c?.title || enr.courseTitle || 'عنوان دوره'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)] mt-1">
                          <span>تاریخ ثبت‌نام: {enr.createdAt ? new Date(enr.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
                          <span>پیشرفت: {enr.progress || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {c?.slug && (
                      <Link
                        href={`/courses/${c.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-lg text-xs font-bold flex items-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> مشاهده دوره
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)]">تاریخچه سفارشات و خریدهای کاربر</h3>
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
              هیچ سفارشی برای این کاربر ثبت نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-secondary)]">
                    <th className="p-3">شناسه سفارش</th>
                    <th className="p-3">مبلغ پرداختی</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">تاریخ پرداخت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--neo-border)]">
                  {orders.map((ord: any) => (
                    <tr key={ord._id} className="hover:bg-[var(--neo-surface-2)]/50">
                      <td className="p-3 font-mono text-xs">{ord.orderNumber || ord._id}</td>
                      <td className="p-3 font-bold">{Number(ord.totalAmount || ord.total || 0).toLocaleString()} تومان</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'completed' || ord.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          ord.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {ord.status === 'completed' || ord.status === 'paid' ? 'پرداخت شده' : ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--neo-text-muted)]">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)]">تیکت‌های پشتیبانی کاربر</h3>
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
              هیچ تیکتی توسط این کاربر ارسال نشده است.
            </div>
          ) : (
            <div className="divide-y divide-[var(--neo-border)]">
              {tickets.map((t: any) => (
                <div key={t._id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-[var(--neo-text-main)]">{t.title || t.subject}</h4>
                    <span className="text-[11px] text-[var(--neo-text-muted)] block mt-0.5">
                      ارسال شده در: {t.createdAt ? new Date(t.createdAt).toLocaleDateString('fa-IR') : 'نامشخص'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    t.status === 'open' ? 'bg-blue-50 text-blue-700' :
                    t.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {t.status === 'open' ? 'در انتظار پاسخ' : t.status === 'closed' ? 'بسته شده' : t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Teaching (if Instructor) */}
      {activeTab === 'teaching' && isInstructor && (
        <div className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">دوره‌های تحت تدریس مدرس</h3>
            {courses.length === 0 ? (
              <p className="text-xs text-[var(--neo-text-muted)] p-4 text-center">دوره‌ای ثبت نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((c: any) => (
                  <div key={c._id} className="p-4 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-[var(--neo-text-main)]">{c.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--neo-text-muted)] mt-1">
                        <span>قیمت: {c.price ? `${Number(c.price).toLocaleString()} تومان` : 'رایگان'}</span>
                        <span>•</span>
                        <span>وضعیت: {c.status}</span>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${c.slug || c._id}`}
                      target="_blank"
                      className="p-2 bg-[var(--neo-surface)] text-[var(--neo-primary)] rounded-xl"
                      title="مشاهده دوره"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 border border-[var(--neo-border)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">کلاس‌های آنلاین و حضوری مدرس</h3>
            {classes.length === 0 ? (
              <p className="text-xs text-[var(--neo-text-muted)] p-4 text-center">کلاسی ثبت نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls: any) => (
                  <div key={cls._id} className="p-4 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-[var(--neo-text-main)]">{cls.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--neo-text-muted)] mt-1">
                        <span>شیوه: {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}</span>
                        <span>•</span>
                        <span>ظرفیت: {cls.capacity || 50} نفر</span>
                      </div>
                    </div>
                    <Link
                      href={`/classes/${cls.slug || cls._id}`}
                      target="_blank"
                      className="p-2 bg-[var(--neo-surface)] text-emerald-600 rounded-xl"
                      title="مشاهده کلاس"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Edit Form with Full Validation */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 border border-[var(--neo-border)] space-y-6">
          <h3 className="font-bold text-sm text-[var(--neo-text-main)] pb-3 border-b border-[var(--neo-border)]">
            ویرایش کامل مشخصات و مجوزهای دسترسی کاربر
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نام *</label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={e => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] ${
                  touched.firstName && errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.firstName && errors.firstName && <p className="text-[10px] text-rose-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نام خانوادگی *</label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={e => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] ${
                  touched.lastName && errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.lastName && errors.lastName && <p className="text-[10px] text-rose-500 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">ایمیل *</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left ${
                  touched.email && errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.email && errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">شماره موبایل</label>
              <input 
                type="tel" 
                value={formData.mobile} 
                onChange={e => handleChange('mobile', e.target.value)}
                onBlur={() => handleBlur('mobile')}
                placeholder="09123456789"
                className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left ${
                  touched.mobile && errors.mobile ? 'border-rose-400 bg-rose-50/20' : 'border-[var(--neo-border)]'
                }`} 
              />
              {touched.mobile && errors.mobile && <p className="text-[10px] text-rose-500 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">رمز عبور جدید (در صورت نیاز به تغییر)</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => handleChange('password', e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)] dir-ltr text-left" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">نقش کاربر</label>
              <select 
                value={formData.role} 
                onChange={e => handleChange('role', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none cursor-pointer"
              >
                {rolesData?.map((r: any) => (
                  <option key={r._id || r.slug} value={r._id || r.slug}>{r.name || r.slug}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">تخصص / عنوان شغلی</label>
            <input 
              type="text" 
              value={formData.specialty} 
              onChange={e => handleChange('specialty', e.target.value)}
              placeholder="مثال: متخصص هوش مصنوعی و پایتون"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">بیوگرافی و معرفی</label>
            <textarea 
              rows={3}
              value={formData.bio} 
              onChange={e => handleChange('bio', e.target.value)}
              placeholder="درباره سوابق و فعالیت‌های کاربر..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs outline-none resize-none" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--neo-border)]">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-2.5 bg-[var(--neo-primary)] hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ذخیره تغییرات کاربر
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
