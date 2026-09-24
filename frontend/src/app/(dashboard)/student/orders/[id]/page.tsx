'use client';

import { useQuery } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { 
  Loader2, ArrowRight, Receipt, CheckCircle, XCircle, Clock, 
  Printer, ShieldCheck, Download, Wallet, CreditCard, ExternalLink, 
  Building2, UserCheck, Share2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OrderInvoiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => commerceApi.getOrderById(id).then(res => res.data),
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium text-sm">در حال بارگذاری صورت‌حساب و فاکتور...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">سفارش یا فاکتور یافت نشد</h3>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          متاسفانه اطلاعات فاکتور مورد نظر یافت نشد یا شما دسترسی به آن ندارید.
        </p>
        <button 
          onClick={() => router.push('/student/payments')} 
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-sm"
        >
          بازگشت به تاریخچه پرداخت‌ها
        </button>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isPending = order.status === 'pending';
  const isFailed = order.status === 'failed';

  const walletApplied = order.walletAmountApplied || 0;
  const gatewayPaid = order.gatewayAmount || (walletApplied === 0 ? order.totalAmount : 0);
  const isHybrid = walletApplied > 0 && gatewayPaid > 0;
  const paymentDetails = order.paymentDetails;
  const buyer = order.user;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link 
          href="/student/payments" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به تاریخچه پرداخت‌ها
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            چاپ و دریافت PDF فاکتور
          </button>
        </div>
      </div>

      {/* Official Tax Invoice Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 text-slate-900 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl">
                ت
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">فاکتور رسمی فروش خدمات آموزشی</h1>
                <span className="text-xs text-slate-500 font-medium">پلتفرم جامع آموزش آنلاین تک‌یاد</span>
              </div>
            </div>
          </div>

          <div className="text-right sm:text-left text-xs text-slate-600 space-y-1">
            <div>
              <span className="text-slate-400 ml-1">شماره فاکتور:</span>
              <strong className="font-mono text-slate-900 text-sm">TY-INV-{order._id.slice(-6).toUpperCase()}</strong>
            </div>
            <div>
              <span className="text-slate-400 ml-1">تاریخ صدور:</span>
              <strong className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</strong>
            </div>
            <div>
              <span className="text-slate-400 ml-1">ساعت ثبت:</span>
              <strong className="font-mono text-slate-900">{new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
          </div>
        </div>

        {/* Parties Information (Seller & Buyer) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Seller */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              <Building2 className="w-4 h-4 text-purple-600" />
              مشخصات ارائه‌دهنده (فروشنده)
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">نام شخص حقوقی:</span>
              <span className="font-semibold text-slate-800">آموزشگاه فناوری و مهارت تک‌یاد</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">شناسه ملی / ثبت:</span>
              <span className="font-mono text-slate-800">۱۰۳۴۰۰۹۸۷۲۱</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">پشتیبانی و ارتباط:</span>
              <span className="font-semibold text-slate-800">support@tekyad.ir · ۰۲۱-۸۸۸۸۰۰۰۰</span>
            </div>
          </div>

          {/* Buyer */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
              <UserCheck className="w-4 h-4 text-purple-600" />
              مشخصات خریدار (دانشجو)
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">نام و نام خانوادگی:</span>
              <span className="font-semibold text-slate-800">
                {buyer ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'دانشجوی تک‌یاد' : 'دانشجوی تک‌یاد'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">پست الکترونیکی:</span>
              <span className="font-mono text-slate-800">{buyer?.email || 'مشخص نشده'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">شناسه کاربری:</span>
              <span className="font-mono text-slate-800">#{order.userId?.toString().slice(-6).toUpperCase()}</span>
            </div>
          </div>

        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3.5 px-4 w-12 text-center">ردیف</th>
                <th className="py-3.5 px-4">شرح خدمت / دوره آموزشی</th>
                <th className="py-3.5 px-4 text-center">نوع</th>
                <th className="py-3.5 px-4 text-left">مبلغ واحد (تومان)</th>
                <th className="py-3.5 px-4 text-left">تخفیف</th>
                <th className="py-3.5 px-4 text-left">مبلغ نهایی (تومان)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items?.map((item: any, idx: number) => {
                const isCourse = item.itemType === 'course';
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.titleSnapshot || item.title}</div>
                      <span className="text-[11px] text-slate-400">شناسه آیتم: #{item.itemId?.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {isCourse ? 'دوره آنلاین' : 'وبینار / کلاس زنده'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left font-mono">
                      {(item.price || item.finalPrice || 0).toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3.5 px-4 text-left font-mono text-emerald-600">
                      {(item.discount || 0).toLocaleString('fa-IR')}
                    </td>
                    <td className="py-3.5 px-4 text-left font-bold font-mono text-slate-900">
                      {(item.finalPrice ?? item.price ?? 0).toLocaleString('fa-IR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown & Hybrid Settlement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Payment Gateway & Tracking Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>اطلاعات تراکنش و تسویه</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isPaid ? 'bg-emerald-100 text-emerald-800' :
                isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
              }`}>
                {isPaid ? 'تراکنش موفق' : isPending ? 'در انتظار پرداخت' : 'ناموفق'}
              </span>
            </h4>

            <div className="flex justify-between">
              <span className="text-slate-500">روش پرداخت:</span>
              <span className="font-bold text-slate-800">
                {isHybrid ? 'ترکیبی (کسر از کیف پول + درگاه شاپرک)' :
                 walletApplied > 0 ? 'پرداخت آنی با کیف پول' : 'درگاه پرداخت شتاب (زرین‌پال/شاپرک)'}
              </span>
            </div>

            {paymentDetails?.authority && (
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">شناسه درگاه (Authority):</span>
                <span className="font-bold text-slate-900">{paymentDetails.authority}</span>
              </div>
            )}

            {paymentDetails?.referenceId && (
              <div className="flex justify-between font-mono">
                <span className="text-slate-500 font-sans">شماره پیگیری مرجع (RRN):</span>
                <span className="font-bold text-emerald-700">{paymentDetails.referenceId}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              این سند الکترونیکی مورد تأیید سامانه آموزش و امور مالیاتی تک‌یاد است.
            </div>
          </div>

          {/* Sum Summary */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-3">
            <div className="flex justify-between text-slate-600">
              <span>جمع ارزش ناخالص خدمات:</span>
              <span className="font-bold font-mono text-slate-900 text-sm">
                {(order.subtotal || order.totalAmount + (order.discountAmount || 0)).toLocaleString('fa-IR')} تومان
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>تخفیف کل (کوپن / جشنواره):</span>
                <span className="font-bold font-mono text-sm">
                  -{order.discountAmount.toLocaleString('fa-IR')} تومان
                </span>
              </div>
            )}

            {walletApplied > 0 && (
              <div className="flex justify-between text-indigo-700 bg-indigo-50/80 p-2 rounded-lg font-bold">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" />
                  کسر شده از کیف پول تک‌یاد:
                </span>
                <span className="font-mono text-sm">-{walletApplied.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}

            {gatewayPaid > 0 && isHybrid && (
              <div className="flex justify-between text-slate-700">
                <span>پرداخت مستقیم درگاه بانکی:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">{gatewayPaid.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}

            <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center text-sm font-black text-slate-900">
              <span className="text-base">مبلغ پرداختی نهایی:</span>
              <span className="text-lg text-emerald-700 font-mono">
                {order.totalAmount?.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>

        </div>

        {/* Digital Signature & Seal */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <div className="font-bold text-slate-800">مهر و امضای امور مالی تک‌یاد</div>
            <div className="text-[11px] text-slate-400">تأییدیه سیستمی بدون نیاز به امضای فیزیکی معتبر است.</div>
          </div>

          <div className="border-2 border-dashed border-emerald-500/70 p-3 rounded-2xl bg-emerald-50/50 text-emerald-800 font-bold text-center text-[11px]">
            ✓ پرداخت شده و معتبر در پایگاه داده شاپرک
          </div>
        </div>

      </div>

    </div>
  );
}
