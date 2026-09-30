'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';
import { 
  Briefcase, GraduationCap, Phone, Mail, FileText, CheckCircle2, 
  XCircle, Clock, Plus, Trash2, Edit3, ExternalLink, Search, 
  Filter, Loader2, Sparkles, Building2, UserCheck, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCareersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'applications' | 'positions'>('applications');
  
  // Applications state
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSearch, setAppSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Positions state
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any | null>(null);
  const [positionForm, setPositionForm] = useState({
    title: '',
    type: 'آنلاین / پاره‌وقت',
    department: 'آموزش',
    location: 'دورکاری',
    description: '',
    requirements: '',
    isActive: true,
    order: 0
  });

  // Queries
  const { data: appsData, isLoading: isAppsLoading } = useQuery({
    queryKey: ['adminCareerApps', appStatusFilter, appSearch],
    queryFn: () => generalApi.getCareerApplicationsAdmin({ status: appStatusFilter, search: appSearch }).then(res => res.data),
    enabled: activeTab === 'applications'
  });

  const { data: positionsData, isLoading: isPositionsLoading } = useQuery({
    queryKey: ['adminJobPositions'],
    queryFn: () => generalApi.getAllJobPositionsAdmin().then(res => res.data),
    enabled: activeTab === 'positions'
  });

  // Application Mutations
  const updateAppMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => generalApi.updateCareerApplicationStatus(id, data),
    onSuccess: () => {
      toast.success('وضعیت درخواست با موفقیت به‌روز شد');
      queryClient.invalidateQueries({ queryKey: ['adminCareerApps'] });
      if (selectedApp) {
        setSelectedApp((prev: any) => ({ ...prev, ...updateAppMutation.variables?.data }));
      }
    },
    onError: () => toast.error('خطا در به‌روزرسانی درخواست')
  });

  const deleteAppMutation = useMutation({
    mutationFn: (id: string) => generalApi.deleteCareerApplication(id),
    onSuccess: () => {
      toast.success('درخواست متقاضی حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCareerApps'] });
      setSelectedApp(null);
    },
    onError: () => toast.error('خطا در حذف درخواست')
  });

  // Job Position Mutations
  const savePositionMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingPosition) {
        return generalApi.updateJobPosition(editingPosition._id, payload);
      }
      return generalApi.createJobPosition(payload);
    },
    onSuccess: () => {
      toast.success(editingPosition ? 'موقعیت شغلی ویرایش شد' : 'موقعیت شغلی جدید افزوده شد');
      queryClient.invalidateQueries({ queryKey: ['adminJobPositions'] });
      setIsPositionModalOpen(false);
      setEditingPosition(null);
    },
    onError: () => toast.error('خطا در ذخیره موقعیت شغلی')
  });

  const deletePositionMutation = useMutation({
    mutationFn: (id: string) => generalApi.deleteJobPosition(id),
    onSuccess: () => {
      toast.success('موقعیت شغلی حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminJobPositions'] });
    },
    onError: () => toast.error('خطا در حذف موقعیت شغلی')
  });

  const applications = appsData?.applications || [];
  const positions = positionsData || [];

  const handleOpenPositionModal = (pos?: any) => {
    if (pos) {
      setEditingPosition(pos);
      setPositionForm({
        title: pos.title,
        type: pos.type,
        department: pos.department || 'آموزش',
        location: pos.location || 'دورکاری',
        description: pos.description || '',
        requirements: (pos.requirements || []).join('\n'),
        isActive: pos.isActive !== false,
        order: pos.order || 0
      });
    } else {
      setEditingPosition(null);
      setPositionForm({
        title: '',
        type: 'آنلاین / پاره‌وقت',
        department: 'آموزش',
        location: 'دورکاری',
        description: '',
        requirements: '',
        isActive: true,
        order: positions.length + 1
      });
    }
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionForm.title.trim()) {
      toast.error('عنوان موقعیت شغلی را وارد کنید');
      return;
    }
    const payload = {
      ...positionForm,
      requirements: positionForm.requirements.split('\n').map(r => r.trim()).filter(Boolean)
    };
    savePositionMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
              مدیریت استخدام و فرصت‌های شغلی
            </h1>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
              مدیریت موقعیت‌های شغلی فعال سایت و بررسی رزومه‌های ارسالی متقاضیان و اساتید
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'positions' && (
            <button
              onClick={() => handleOpenPositionModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-2xl hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              افزودن موقعیت شغلی جدید
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--neo-border)] pb-2">
        <button
          onClick={() => { setActiveTab('applications'); setSelectedApp(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'applications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[var(--neo-border)]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          درخواست‌های همکاری و رزومه‌ها
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {appsData?.total || applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === 'positions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-[var(--neo-border)]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          موقعیت‌های شغلی سایت (/careers)
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {positions.length}
          </span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-[var(--neo-border)]">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو نام متقاضی، شماره موبایل، تخصص یا موقعیت شغلی..."
                value={appSearch}
                onChange={e => setAppSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={appStatusFilter}
                onChange={e => setAppStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="reviewed">بررسی شده</option>
                <option value="interview">دعوت به مصاحبه</option>
                <option value="accepted">تایید و پذیرفته‌شده</option>
                <option value="rejected">رد شده</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List */}
            <div className={`${selectedApp ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
              {isAppsLoading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
                  <span className="text-xs text-gray-500 font-bold">در حال دریافت متقاضیان...</span>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-600">درخواستی یافت نشد</p>
                  <p className="text-xs text-gray-400 mt-1">رزومه‌های ثبت شده در صفحه /careers در اینجا لیست می‌شوند.</p>
                </div>
              ) : (
                applications.map((app: any) => {
                  const isSelected = selectedApp?._id === app._id;
                  return (
                    <div
                      key={app._id}
                      onClick={() => { setSelectedApp(app); setAdminNotes(app.adminNotes || ''); }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                        isSelected 
                          ? 'border-[var(--neo-primary)] ring-2 ring-blue-100' 
                          : app.status === 'pending'
                            ? 'border-purple-200 bg-purple-50/15'
                            : 'border-[var(--neo-border)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {app.status === 'pending' && (
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            )}
                            <h3 className="font-bold text-sm text-[var(--neo-text-main)]">
                              {app.fullName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {app.jobTitle || app.specialty}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1 font-mono dir-ltr">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {app.mobile}
                            </span>
                            <span className="flex items-center gap-1 font-mono dir-ltr">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {app.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(app.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          app.status === 'pending'
                            ? 'bg-purple-100 text-purple-700'
                            : app.status === 'interview'
                              ? 'bg-blue-100 text-blue-700'
                              : app.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-700'
                                : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-gray-100 text-gray-700'
                        }`}>
                          {app.status === 'pending' && 'در انتظار بررسی'}
                          {app.status === 'reviewed' && 'بررسی شده'}
                          {app.status === 'interview' && 'مصاحبه'}
                          {app.status === 'accepted' && 'پذیرفته‌شده'}
                          {app.status === 'rejected' && 'رد شده'}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                        <span className="text-gray-500">
                          مدرک تحصیلی: <strong className="text-gray-700">{app.degree || 'نامشخص'}</strong>
                        </span>
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            مشاهده رزومه ارسالی
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Application Detail Drawer */}
            {selectedApp && (
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm sticky top-4 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--neo-border)]">
                  <span className="font-bold text-sm text-[var(--neo-text-main)]">جزئیات پرونده متقاضی</span>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-xs text-gray-400 hover:text-gray-700 font-bold"
                  >
                    بستن
                  </button>
                </div>

                {/* Candidate details */}
                <div className="p-4 bg-[var(--neo-surface-2)] rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">نام متقاضی:</span>
                    <strong className="text-gray-800">{selectedApp.fullName}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">شماره تماس:</span>
                    <a href={`tel:${selectedApp.mobile}`} className="font-mono text-blue-600 font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedApp.mobile}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">ایمیل:</span>
                    <a href={`mailto:${selectedApp.email}`} className="font-mono text-gray-700 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedApp.email}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">حوزه تخصصی:</span>
                    <strong className="text-gray-800">{selectedApp.specialty}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مدرک تحصیلی:</span>
                    <span className="text-gray-700">{selectedApp.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">سابقه کار:</span>
                    <span className="text-gray-700">{selectedApp.experience}</span>
                  </div>
                </div>

                {/* Description & Demo Links */}
                {selectedApp.description && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 mb-1">توضیحات و انگیزه‌نامه متقاضی:</h4>
                    <p className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed">
                      {selectedApp.description}
                    </p>
                  </div>
                )}

                {/* Attachments */}
                <div className="flex flex-wrap gap-2">
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100"
                    >
                      <FileText className="w-4 h-4" />
                      دریافت فایل رزومه
                    </a>
                  )}
                  {selectedApp.demoUrl && (
                    <a
                      href={selectedApp.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      لینک نمونه‌کار / گیت‌هاب
                    </a>
                  )}
                </div>

                {/* Status Switcher */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">تغییر وضعیت پرونده:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'reviewed', label: 'بررسی شده', color: 'bg-gray-100 text-gray-800' },
                      { id: 'interview', label: 'دعوت به مصاحبه', color: 'bg-blue-100 text-blue-800' },
                      { id: 'accepted', label: 'پذیرش و استخدام', color: 'bg-emerald-100 text-emerald-800' },
                      { id: 'rejected', label: 'رد درخواست', color: 'bg-rose-100 text-rose-800' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => updateAppMutation.mutate({ id: selectedApp._id, data: { status: st.id } })}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                          selectedApp.status === st.id
                            ? 'bg-slate-900 text-white border-transparent'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Internal Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">یادداشت داخلی تیم منابع انسانی:</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="نتیجه مصاحبه، هماهنگی زمان جلسه، پیشنهادات..."
                    className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                  <button
                    onClick={() => updateAppMutation.mutate({ id: selectedApp._id, data: { adminNotes } })}
                    disabled={updateAppMutation.isPending}
                    className="mt-2 w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ذخیره یادداشت مصاحبه
                  </button>
                </div>

                {/* Delete */}
                <div className="pt-2 border-t border-[var(--neo-border)] flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (confirm('آیا از حذف این درخواست اطمینان دارید؟')) {
                        deleteAppMutation.mutate(selectedApp._id);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف درخواست
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOB OPENINGS */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {isPositionsLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
              <span className="text-xs text-gray-500 font-bold">در حال بارگذاری فرصت‌های شغلی...</span>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">هنوز موقعیت شغلی ثبت نشده است</p>
              <button
                onClick={() => handleOpenPositionModal()}
                className="mt-4 px-4 py-2 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl"
              >
                ایجاد اولین موقعیت شغلی
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((pos: any) => (
                <div key={pos._id} className="p-5 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[var(--neo-text-main)]">{pos.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pos.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {pos.isActive ? 'فعال و در حال جذب' : 'غیرفعال'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>نوع: {pos.type}</span>
                        <span>دپارتمان: {pos.department}</span>
                        <span>مکان: {pos.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPositionModal(pos)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`آیا موقعیت شغلی «${pos.title}» حذف شود؟`)) {
                            deletePositionMutation.mutate(pos._id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {pos.description && (
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                      {pos.description}
                    </p>
                  )}

                  {pos.requirements && pos.requirements.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-400">شرایط احراز:</span>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc pr-4">
                        {pos.requirements.map((req: string, i: number) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Position Modal */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[var(--neo-border)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neo-border)]">
              <h3 className="text-base font-black text-gray-900">
                {editingPosition ? 'ویرایش موقعیت شغلی' : 'افزودن موقعیت شغلی جدید'}
              </h3>
              <button
                onClick={() => setIsPositionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePosition} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان شغل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مدرس ارشد پایتون و هوش مصنوعی"
                  value={positionForm.title}
                  onChange={e => setPositionForm({ ...positionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نوع همکاری</label>
                  <select
                    value={positionForm.type}
                    onChange={e => setPositionForm({ ...positionForm, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
                  >
                    <option value="آنلاین / پاره‌وقت">آنلاین / پاره‌وقت</option>
                    <option value="حضوری / تمام‌وقت">حضوری / تمام‌وقت</option>
                    <option value="پروژه‌ای / دورکاری">پروژه‌ای / دورکاری</option>
                    <option value="کارآموزی">کارآموزی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">دپارتمان</label>
                  <input
                    type="text"
                    value={positionForm.department}
                    onChange={e => setPositionForm({ ...positionForm, department: e.target.value })}
                    placeholder="آموزش، فنی، محتوا..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">توضیحات و مسئولیت‌ها</label>
                <textarea
                  rows={3}
                  value={positionForm.description}
                  onChange={e => setPositionForm({ ...positionForm, description: e.target.value })}
                  placeholder="توضیح نقش و وظایف این موقعیت شغلی..."
                  className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  شرایط احراز و مهارت‌های لازم (هر خط یک مورد)
                </label>
                <textarea
                  rows={3}
                  value={positionForm.requirements}
                  onChange={e => setPositionForm({ ...positionForm, requirements: e.target.value })}
                  placeholder="حداقل ۳ سال سابقه کاری&#10;تسلط کامل بر مفاهیم&#10;فن بیان مناسب"
                  className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="posActive"
                  checked={positionForm.isActive}
                  onChange={e => setPositionForm({ ...positionForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[var(--neo-primary)]"
                />
                <label htmlFor="posActive" className="text-xs font-bold text-gray-700">
                  نمایش در سایت (/careers) و امکان دریافت درخواست
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--neo-border)]">
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savePositionMutation.isPending}
                  className="px-6 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
                >
                  {savePositionMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ذخیره موقعیت شغلی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
