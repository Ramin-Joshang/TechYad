'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Loader2, Search, Video, Calendar, Users, Plus, Edit, Trash2, 
  Save, X, ExternalLink, Eye, DollarSign, CheckCircle2, Clock, ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUploader } from '@/components/common/MediaUploader';
import { AttendanceModal } from '@/components/classes/AttendanceModal';
import { ClassFormModal } from '@/components/classes/ClassFormModal';

export default function AdminClassesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [detailClass, setDetailClass] = useState<any | null>(null);
  const [updatingClassId, setUpdatingClassId] = useState<string | null>(null);
  const [attendanceClass, setAttendanceClass] = useState<any | null>(null);

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: () => adminApi.getClasses().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createClass(data),
    onSuccess: () => {
      toast.success('کلاس با تمام سرفصل‌ها و مشخصات با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      setIsFormOpen(false);
      setEditingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد کلاس');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateClass(editingClass?._id, data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      setIsFormOpen(false);
      setEditingClass(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش کلاس');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      setUpdatingClassId(id);
      return adminApi.updateClass(id, { status });
    },
    onSuccess: () => {
      toast.success('وضعیت کلاس تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در تغییر وضعیت کلاس');
    },
    onSettled: () => setUpdatingClassId(null)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteClass(id),
    onSuccess: () => {
      toast.success('کلاس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      if (detailClass?._id === editingClass?._id) setDetailClass(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف کلاس');
    }
  });

  const handleCreate = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingClass?._id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const classes = classesData?.classes || [];
  const filteredClasses = classes.filter((c: any) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || 
                        c.slug?.toLowerCase().includes(search.toLowerCase());
    const matchMode = modeFilter === 'all' || c.mode === modeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchMode && matchStatus;
  });

  // Statistics
  const totalClasses = classes.length;
  const onlineClasses = classes.filter((c: any) => c.mode === 'online').length;
  const inPersonClasses = classes.filter((c: any) => c.mode === 'in_person').length;
  const activeClasses = classes.filter((c: any) => c.status !== 'cancelled' && c.status !== 'draft').length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Video className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">مدیریت جامع کلاس‌ها و کارگاه‌ها</h1>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشاهده، ایجاد، تغییر وضعیت و ویرایش کلاس‌های آنلاین و حضوری</p>
          </div>
        </div>
        <button 
          id="admin-create-class-btn"
          onClick={handleCreate} 
          className="flex items-center gap-2 bg-[var(--neo-primary)] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md transition"
        >
          <Plus className="w-4 h-4" /> ایجاد کلاس جدید
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Video className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کل کلاس‌ها</span>
            <h4 className="text-xl font-black text-[var(--neo-text-main)]">{totalClasses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کلاس‌های فعال</span>
            <h4 className="text-xl font-black text-emerald-600">{activeClasses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کلاس‌های آنلاین</span>
            <h4 className="text-xl font-black text-purple-600">{onlineClasses}</h4>
          </div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-2xl border border-[var(--neo-border)] flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Calendar className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-[var(--neo-text-secondary)] font-medium">کلاس‌های حضوری</span>
            <h4 className="text-xl font-black text-amber-600">{inPersonClasses}</h4>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی عنوان یا نامک کلاس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-9 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">همه شیوه‌ها</option>
            <option value="online">فقط آنلاین</option>
            <option value="in_person">فقط حضوری</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">فعال</option>
            <option value="draft">پیش‌نویس</option>
            <option value="completed">پایان یافته</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-16 bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] text-center text-[var(--neo-text-secondary)] font-medium">
          کلاسی با مشخصات فیلتر شده یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls: any) => {
            const isUpdating = updatingClassId === cls._id;

            return (
              <div key={cls._id} className="bg-[var(--neo-surface)] rounded-3xl overflow-hidden border border-[var(--neo-border)] shadow-sm flex flex-col hover:shadow-md transition-all group">
                <div className="aspect-video bg-[var(--neo-surface-2)] relative overflow-hidden">
                  <img 
                    src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/250`} 
                    alt={cls.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="bg-[var(--neo-surface)]/90 backdrop-blur text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                      {cls.mode === 'online' ? '🌐 آنلاین' : '🏛️ حضوری'}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm ${
                      cls.status === 'published' ? 'bg-emerald-500 text-white' :
                      cls.status === 'draft' ? 'bg-gray-500 text-white' :
                      cls.status === 'cancelled' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {cls.status === 'published' ? 'فعال' : cls.status === 'draft' ? 'پیش‌نویس' : cls.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
                    </span>
                  </div>

                  <div className="absolute top-3 left-3 flex gap-1 bg-[var(--neo-surface)]/90 backdrop-blur p-1 rounded-xl shadow-sm">
                    <button 
                      onClick={() => handleEdit(cls)} 
                      className="p-1.5 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition" 
                      title="ویرایش مشخصات کلاس"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { if (confirm(`آیا از حذف کلاس "${cls.title}" اطمینان دارید؟`)) deleteMutation.mutate(cls._id); }} 
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition" 
                      title="حذف کلاس"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-[var(--neo-text-main)] line-clamp-1">{cls.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--neo-text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                    {cls.shortDescription || 'توضیحاتی برای این کلاس ثبت نشده است.'}
                  </p>
                  
                  <div className="mt-auto space-y-2 mb-4 text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)]/50 p-3 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        تاریخ شروع:
                      </span>
                      <span className="font-bold text-[var(--neo-text-main)] dir-ltr">
                        {cls.startDate ? new Date(cls.startDate).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : 'نامشخص'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        ظرفیت:
                      </span>
                      <span className="font-bold text-[var(--neo-text-main)]">
                        {cls.capacity || cls.maxStudents || '۵۰'} نفر
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                        هزینه:
                      </span>
                      <span className="font-black text-[var(--neo-text-main)]">
                        {!cls.price || cls.price === 0 ? 'رایگان' : `${Number(cls.price).toLocaleString()} تومان`}
                      </span>
                    </div>
                  </div>

                  {/* Status Inline Changer */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] text-[var(--neo-text-muted)] font-medium">تغییر وضعیت:</span>
                    <select
                      value={cls.status || 'published'}
                      disabled={isUpdating}
                      onChange={(e) => updateStatusMutation.mutate({ id: cls._id, status: e.target.value })}
                      className="px-2 py-1 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-lg text-[10px] font-bold outline-none cursor-pointer"
                    >
                      <option value="published">فعال (منتشر شده)</option>
                      <option value="draft">پیش‌نویس</option>
                      <option value="completed">پایان یافته</option>
                      <option value="cancelled">لغو شده</option>
                    </select>
                  </div>
                  
                  {/* Attendance Management Button */}
                  <button
                    onClick={() => setAttendanceClass(cls)}
                    className="w-full py-2 mb-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                    حضور و غیاب دانشجوها
                  </button>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/classes/${cls.slug || cls._id}`} 
                      target="_blank"
                      className="flex-1 text-center py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      مشاهده در سایت
                    </Link>

                    <button
                      onClick={() => setDetailClass(cls)}
                      className="px-3 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] font-bold text-xs rounded-xl transition"
                      title="مشاهده جزئیات کامل"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Detail Modal */}
      {detailClass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--neo-border)]">
              <h3 className="font-black text-base text-[var(--neo-text-main)]">گزارش و جزئیات کلاس</h3>
              <button onClick={() => setDetailClass(null)} className="p-1.5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video relative rounded-2xl overflow-hidden">
              <img src={detailClass.thumbnail || `https://picsum.photos/seed/${detailClass._id}/500/250`} alt={detailClass.title} className="w-full h-full object-cover" />
            </div>

            <div>
              <h2 className="text-lg font-black text-[var(--neo-text-main)]">{detailClass.title}</h2>
              <p className="text-xs text-[var(--neo-text-muted)] mt-0.5 dir-ltr text-right">/{detailClass.slug}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[10px] text-[var(--neo-text-secondary)] block">هزینه ثبت‌نام</span>
                <span className="font-black text-[var(--neo-text-main)]">
                  {detailClass.price ? `${detailClass.price.toLocaleString()} تومان` : 'رایگان'}
                </span>
              </div>
              <div className="p-3 bg-[var(--neo-surface-2)] rounded-xl">
                <span className="text-[10px] text-[var(--neo-text-secondary)] block">نحوه برگزاری</span>
                <span className="font-black text-[var(--neo-text-main)]">
                  {detailClass.mode === 'online' ? 'آنلاین / وبینار' : 'حضوری'}
                </span>
              </div>
            </div>

            {detailClass.shortDescription && (
              <div>
                <h4 className="text-xs font-bold text-[var(--neo-text-main)] mb-1">توضیحات کوتاه</h4>
                <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed bg-[var(--neo-surface-2)] p-3 rounded-xl">
                  {detailClass.shortDescription}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-[var(--neo-border)]">
              <Link
                href={`/classes/${detailClass.slug || detailClass._id}`}
                target="_blank"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-4 h-4" /> مشاهده صفحه عمومی کلاس در وب‌سایت
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal for Admin */}
      {attendanceClass && (
        <AttendanceModal
          classItem={attendanceClass}
          onClose={() => setAttendanceClass(null)}
          isAdmin={true}
        />
      )}

      {/* Full Class Creation & Editing Modal for Admin */}
      <ClassFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClass(null);
        }}
        initialData={editingClass}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        title={editingClass ? `ویرایش مشخصات کلاس: ${editingClass.title}` : 'تعریف و ثبت کلاس جدید با تمام جزئیات'}
        isAdmin={true}
      />
    </div>
  );
}
