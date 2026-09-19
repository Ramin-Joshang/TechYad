'use client';

import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceApi.checkoutPreview().then(res => res.data),
    enabled: !!isAuthenticated && !isInitializing
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => commerceApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('مورد از سبد خرید حذف شد');
    },
    onError: () => {
      toast.error('خطا در حذف از سبد خرید');
    }
  });

  if (isInitializing || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--neo-bg)]">
        <Loader2 className="w-12 h-12 text-[var(--neo-secondary)] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="bg-[var(--neo-bg)] min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-4">لطفاً وارد حساب کاربری خود شوید</h2>
          <p className="text-[var(--neo-text-muted)] mb-8 max-w-md mx-auto">
            برای مشاهده و مدیریت سبد خرید، باید ابتدا وارد حساب کاربری خود شوید.
          </p>
          <Link href="/login?redirect=/cart" className="inline-flex items-center gap-2 bg-[var(--neo-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-[var(--neo-primary)]/20">
            ورود به حساب کاربری
          </Link>
        </div>
      </main>
    );
  }

  const items = cartData?.items || [];
  const total = cartData?.subtotal || 0;

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[var(--neo-text-main)] mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-[var(--neo-primary)]" />
          سبد خرید شما
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[var(--neo-border)]">
            <div className="w-24 h-24 bg-[var(--neo-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-4">سبد خرید شما خالی است!</h2>
            <p className="text-[var(--neo-text-muted)] mb-8 max-w-md mx-auto">
              شما هنوز هیچ دوره‌ای یا کلاسی به سبد خرید خود اضافه نکرده‌اید. با مراجعه به بخش دوره‌ها یا کلاس‌ها می‌توانید مهارت جدیدی یاد بگیرید.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/courses" className="inline-flex items-center gap-2 bg-[var(--neo-primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-[var(--neo-primary)]/20">
                مشاهده دوره‌های آموزشی
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/classes" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/20">
                مشاهده کلاس‌ها
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => {
                const itemPrice = item.finalPrice ?? item.price ?? 0;
                const title = item.titleSnapshot || item.title || 'دوره آموزشی';
                const instructor = item.instructorName || 'استاد تک‌یاد';
                const thumb = item.thumbnail || `https://picsum.photos/seed/${item.itemId || 'cart'}/400/250`;
                const isCourse = item.itemType === 'course';

                return (
                  <div key={item.itemId || Math.random()} className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm flex flex-col sm:flex-row items-center gap-5">
                    <img 
                      src={thumb} 
                      alt={title} 
                      className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0 bg-gray-100" 
                      onError={(e: any) => {
                        e.target.src = `https://picsum.photos/seed/techyad/400/250`;
                      }}
                    />
                    
                    <div className="flex-1 text-center sm:text-right min-w-0 w-full">
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-2 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                          isCourse ? 'bg-blue-50 text-[var(--neo-primary)]' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {isCourse ? 'دوره آموزشی' : 'کلاس آنلاین / حضوری'}
                        </span>
                        <h3 className="font-bold text-[var(--neo-text-main)] text-base sm:text-lg truncate max-w-full">
                          {title}
                        </h3>
                      </div>
                      <p className="text-sm text-[var(--neo-text-muted)] mb-3">مدرس: {instructor}</p>
                      <div className="text-[var(--neo-primary)] font-bold text-base sm:text-lg">
                        {itemPrice === 0 ? 'رایگان' : `${itemPrice.toLocaleString('fa-IR')} تومان`}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItemMutation.mutate(item.itemId)}
                      disabled={removeItemMutation.isPending}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition self-end sm:self-center shrink-0 disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
                      title="حذف از سبد خرید"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="sm:hidden">حذف</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)] sticky top-24">
                <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 border-b border-[var(--neo-border)] pb-4">خلاصه سفارش</h3>
                
                <div className="space-y-4 mb-6 text-[var(--neo-text-secondary)]">
                  <div className="flex justify-between items-center">
                    <span>مبلغ کل ({items.length} مورد)</span>
                    <span className="font-bold">{(total ?? 0).toLocaleString('fa-IR')} تومان</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>تخفیف</span>
                    <span className="font-bold">۰ تومان</span>
                  </div>
                  <div className="pt-4 border-t border-[var(--neo-border)] flex justify-between items-center text-lg font-bold text-[var(--neo-text-main)]">
                    <span>مبلغ قابل پرداخت</span>
                    <span className="text-[var(--neo-primary)]">{(total ?? 0).toLocaleString('fa-IR')} تومان</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30">
                  تکمیل خرید و پرداخت
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--neo-text-muted)] bg-[var(--neo-bg)] p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  پرداخت امن از طریق درگاه‌های بانکی عضو شتاب
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
