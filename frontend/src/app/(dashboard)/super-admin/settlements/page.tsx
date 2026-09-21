'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Wallet, CheckCircle, Clock, XCircle, ArrowUpRight, 
  Search, Plus, Loader2, AlertCircle, Building2, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettlementsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusToSet, setStatusToSet] = useState<'completed' | 'rejected'>('completed');

  // New settlement form state
  const [newSettlement, setNewSettlement] = useState({
    instructorId: '',
    amount: '',
    shabaNumber: 'IR',
    accountHolderName: '',
    bankName: '',
    notes: '',
    status: 'pending'
  });

  // Fetch settlements
  const { data: resData, isLoading } = useQuery({
    queryKey: ['settlements', filterStatus],
    queryFn: () => superAdminApi.getSettlements({ status: filterStatus }).then((res: any) => res.data)
  });

  // Fetch instructors for dropdown
  const { data: instructorsData } = useQuery({
    queryKey: ['instructorsList'],
    queryFn: () => adminApi.getUsers({ role: 'instructor' }).then((res: any) => res.data)
  });

  // Mutation to create settlement
  const createMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.createSettlement(data),
    onSuccess: () => {
      toast.success('درخواست تسویه‌حساب با موفقیت ثبت شد');
      setIsModalOpen(false);
      setNewSettlement({
        instructorId: '',
        amount: '',
        shabaNumber: 'IR',
        accountHolderName: '',
        bankName: '',
        notes: '',
        status: 'pending'
      });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت درخواست');
    }
  });

  // Mutation to update settlement status
  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string; status: string; trackingCode?: string; rejectionReason?: string }) => 
      superAdminApi.updateSettlementStatus(data.id, data),
    onSuccess: () => {
      toast.success('وضعیت تسویه‌حساب با موفقیت بروزرسانی شد');
      setProcessModalOpen(false);
      setSelectedSettlement(null);
      setTrackingCode('');
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در بروزرسانی وضعیت');
    }
  });

  const settlements = resData?.settlements || [];
  const stats = resData?.stats || { pendingCount: 0, totalPaidOut: 0, pendingAmount: 0, totalSettlements: 0 };
  const instructors = instructorsData?.users || instructorsData || [];

  const handleOpenProcess = (settlement: any, status: 'completed' | 'rejected') => {
    setSelectedSettlement(settlement);
    setStatusToSet(status);
    setTrackingCode(settlement.trackingCode || '');
    setRejectionReason('');
    setProcessModalOpen(true);
  };

  const submitProcess = () => {
    if (!selectedSettlement) return;
    if (statusToSet === 'completed' && !trackingCode.trim()) {
      toast.error('لطفاً شماره پیگیری یا ارجاع بانکی را وارد نمایید');
      return;
    }
    if (statusToSet === 'rejected' && !rejectionReason.trim()) {
      toast.error('لطفاً دلیل رد درخواست را وارد نمایید');
      return;
    }

    updateStatusMutation.mutate({
      id: selectedSettlement._id,
      status: statusToSet,
      trackingCode: trackingCode.trim(),
      rejectionReason: rejectionReason.trim()
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">تسویه‌حساب با مدرسین و اساتید</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">مدیریت سهم اساتید، واریزهای بانکی و ثبت شماره شبا</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          ثبت سند تسویه‌حساب جدید
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>درخواست‌های در انتظار</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.pendingCount.toLocaleString('fa-IR')}
          </div>
          <div className="text-xs text-gray-400 mt-1">نیازمند واریز و بررسی</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>مبلغ در انتظار پرداخت</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {stats.pendingAmount.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">کل تعهدات مالی معوق</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>کل پرداختی‌های انجام‌شده</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.totalPaidOut.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">مجموع واریز به حساب اساتید</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>کل اسناد مالی</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {stats.totalSettlements.toLocaleString('fa-IR')}
          </div>
          <div className="text-xs text-gray-400 mt-1">تعداد رکوردهای مالی ثبت‌شده</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[var(--neo-border)] w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          همه اسناد
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          در انتظار بررسی ({stats.pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'completed' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          تسویه و واریزشده
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          رد شده
        </button>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Wallet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">سند تسویه‌حسابی با این فیلتر یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-4">استاد / مدرس</th>
                  <th className="p-4">مبلغ (تومان)</th>
                  <th className="p-4">اطلاعات بانکی و شبا</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">کد پیگیری</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map((item: any) => {
                  const inst = item.instructorId;
                  const instName = inst ? `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || inst.email : 'نامشخص';
                  
                  return (
                    <tr key={item._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div>{instName}</div>
                            <div className="text-xs font-normal text-gray-400">{inst?.email || inst?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-black text-gray-900">
                        {Number(item.amount).toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">تومان</span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                          {item.shabaNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.accountHolderName} {item.bankName ? `(${item.bankName})` : ''}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-4">
                        {item.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            در انتظار واریز
                          </span>
                        )}
                        {item.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            واریز شده
                          </span>
                        )}
                        {item.status === 'rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            رد شده
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-600">
                        {item.trackingCode || (
                          <span className="text-gray-400 font-sans">-</span>
                        )}
                        {item.rejectionReason && (
                          <div className="text-[11px] text-red-500 font-sans mt-0.5 max-w-xs truncate" title={item.rejectionReason}>
                            علت رد: {item.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {item.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenProcess(item, 'completed')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              واریز شد
                            </button>
                            <button
                              onClick={() => handleOpenProcess(item, 'rejected')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                            >
                              رد درخواست
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">نهایی‌شده</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Settlement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--neo-border)] space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-gray-900 text-lg">ثبت سند تسویه‌حساب جدید</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">انتخاب استاد / مدرس *</label>
                <select
                  value={newSettlement.instructorId}
                  onChange={(e) => setNewSettlement({ ...newSettlement, instructorId: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- یک استاد انتخاب کنید --</option>
                  {instructors.map((u: any) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} ({u.email || u.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">مبلغ تسویه (تومان) *</label>
                <input
                  type="number"
                  placeholder="مثلاً: 2500000"
                  value={newSettlement.amount}
                  onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">شماره شبا (با IR) *</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="IR123456789012345678901234"
                  value={newSettlement.shabaNumber}
                  onChange={(e) => setNewSettlement({ ...newSettlement, shabaNumber: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام صاحب حساب *</label>
                  <input
                    type="text"
                    placeholder="نام و نام خانوادگی"
                    value={newSettlement.accountHolderName}
                    onChange={(e) => setNewSettlement({ ...newSettlement, accountHolderName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">نام بانک</label>
                  <input
                    type="text"
                    placeholder="مثلاً: ملت، سامان"
                    value={newSettlement.bankName}
                    onChange={(e) => setNewSettlement({ ...newSettlement, bankName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وضعیت اولیه</label>
                <select
                  value={newSettlement.status}
                  onChange={(e) => setNewSettlement({ ...newSettlement, status: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="pending">در انتظار پرداخت (پیش‌فرض)</option>
                  <option value="completed">واریز شده به حساب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">یادداشت داخلی (اختیاری)</label>
                <textarea
                  rows={2}
                  placeholder="توضیحات بابت دوره یا فاکتور..."
                  value={newSettlement.notes}
                  onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                انصراف
              </button>
              <button
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate(newSettlement)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                ثبت سند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Process Settlement (Complete or Reject) */}
      {processModalOpen && selectedSettlement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[var(--neo-border)] space-y-4">
            <h3 className="font-black text-gray-900 text-lg">
              {statusToSet === 'completed' ? 'تایید واریز به حساب استاد' : 'رد درخواست تسویه‌حساب'}
            </h3>

            <p className="text-xs text-gray-500">
              مبلغ: <span className="font-bold text-gray-800">{Number(selectedSettlement.amount).toLocaleString('fa-IR')} تومان</span> به نام{' '}
              <span className="font-bold text-gray-800">{selectedSettlement.accountHolderName}</span>
            </p>

            {statusToSet === 'completed' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">کد پیگیری یا شماره ارجاع بانکی (پایا/ساتنا) *</label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثلاً: TRK-9823412"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">علت رد درخواست *</label>
                <textarea
                  rows={3}
                  placeholder="دلیل عدم پرداخت (مثلاً نامعتبر بودن شماره شبا یا مسدودی حساب)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button
                onClick={() => setProcessModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                انصراف
              </button>
              <button
                disabled={updateStatusMutation.isPending}
                onClick={submitProcess}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 ${
                  statusToSet === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {updateStatusMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {statusToSet === 'completed' ? 'ثبت واریز نهایی' : 'ثبت رد درخواست'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
