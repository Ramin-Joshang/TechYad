'use client';

import Link from 'next/link';
import { 
  Monitor, MapPin, Clock, Calendar, Users, Star, 
  ArrowLeft, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';
import { format } from 'date-fns-jalali';
import { getImageUrl, handleImageError } from '@/lib/utils';

export interface ClassCardProps {
  cls: any;
  variant?: 'standard' | 'compact';
}

export function ClassCard({ cls, variant = 'standard' }: ClassCardProps) {
  if (!cls) return null;

  const isOnline = cls.mode === 'online';
  const instructor = cls.instructors?.[0] || cls.instructor;
  const instructorName = typeof instructor === 'object' && instructor !== null
    ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.name
    : (typeof instructor === 'string' ? instructor : 'استاد تک‌یاد');
  const instructorAvatar = instructor?.personnelPhoto || instructor?.avatar;
  const instructorId = instructor?.slug || instructor?._id;

  const startDate = cls.startDate ? new Date(cls.startDate) : new Date();
  const enrolled = cls.enrolledCount || 0;
  const capacity = cls.capacity || 20;
  const isFull = enrolled >= capacity;
  const isStarted = startDate <= new Date();
  const remaining = Math.max(0, capacity - enrolled);
  const isRegistrationClosed = cls.isRegistrationOpen === false || (isStarted && cls.registrationOpen !== true);

  const rating = cls.averageRating || cls.rating || 5.0;
  const sessions = cls.sessions || cls.totalSessions || 10;
  const price = cls.price ?? 0;
  const discountPrice = cls.discountPrice;
  const hasDiscount = discountPrice !== undefined && discountPrice !== null && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const isFree = finalPrice === 0;

  // Status computation
  let statusBadge = {
    label: 'در حال ثبت‌نام',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  };

  if (cls.status === 'completed') {
    statusBadge = {
      label: 'پایان یافته',
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    };
  } else if (cls.status === 'cancelled') {
    statusBadge = {
      label: 'لغو شده',
      color: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    };
  } else if (isRegistrationClosed) {
    statusBadge = {
      label: 'ثبت‌نام بسته شد',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    };
  } else if (isFull) {
    statusBadge = {
      label: 'تکمیل ظرفیت',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    };
  } else if (remaining <= 3) {
    statusBadge = {
      label: `تنها ${remaining} نفر ظرفیت`,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
    };
  } else if (isStarted) {
    statusBadge = {
      label: 'در حال برگزاری',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
    };
  }

  const linkHref = `/classes/${cls.slug || cls._id}`;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:shadow-xl hover:shadow-[var(--neo-primary)]/5 transition duration-300 text-right h-full">
      
      {/* 1. Class Image Poster Frame (Aspect 16/10 matching CourseCard) */}
      <Link href={linkHref} className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)] block shrink-0">
        <img
          src={getImageUrl(cls.thumbnail || cls.coverImage || cls.banner, 'class', cls.title)}
          alt={cls.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => handleImageError(e, 'class', cls.title)}
        />

        {/* Top Right Badges */}
        <div className="absolute top-4 right-4 flex flex-wrap gap-2 z-10">
          {cls.categoryId?.name && (
            <div className="bg-white/90 backdrop-blur text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
              {cls.categoryId.name}
            </div>
          )}
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs flex items-center gap-1.5 ${
            isOnline 
              ? 'bg-blue-600/90 text-white' 
              : 'bg-emerald-600/90 text-white'
          }`}>
            {isOnline ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'آنلاین (Live)' : 'کارگاه حضوری'}</span>
          </span>
          {isRegistrationClosed && (
            <div className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
              ثبت‌نام بسته شد
            </div>
          )}
        </div>

        {/* Top Left Badges (Discount or Pre-registration) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 items-end z-10">
          {hasDiscount && !isFree && (
            <div className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-2xs">
              {Math.round((1 - (discountPrice! / price)) * 100)}% تخفیف
            </div>
          )}
          {cls.allowPreRegistration && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/95 text-white shadow-2xs backdrop-blur-xs">
              پیش‌ثبت‌نام بیعانه
            </span>
          )}
        </div>
      </Link>

      {/* 2. Card Body Content */}
      <div className="p-5 flex flex-col flex-grow text-right">
        
        {/* Status & Rating Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span>{Number(rating).toFixed(1)}</span>
            <span className="text-[var(--neo-text-muted)] font-normal text-[11px]">({enrolled} دانشجو)</span>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${statusBadge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} animate-pulse`} />
            <span>{statusBadge.label}</span>
          </span>
        </div>

        {/* Title */}
        <Link href={linkHref} className="block mb-2">
          <h3 className="font-bold text-[var(--neo-text-main)] mb-2 line-clamp-2 group-hover:text-[var(--neo-primary)] transition text-base leading-snug">
            {cls.title}
          </h3>
        </Link>

        {/* Instructor Info */}
        <Link
          href={`/instructors/${instructorId || ''}`}
          className="flex items-center gap-2 mb-4 text-xs text-[var(--neo-text-muted)] hover:text-blue-600 transition w-fit group/inst"
          title="مشاهده رزومه و کلاس‌های استاد"
        >
          <img 
            src={getImageUrl(instructorAvatar, 'avatar', instructorName)} 
            onError={(e) => handleImageError(e, 'avatar', instructorName)}
            className="w-6 h-6 rounded-full object-cover border border-slate-200" 
            alt={instructorName} 
          />
          <span className="truncate font-medium">{instructorName}</span>
          <span className="text-[10px] text-slate-400 group-hover/inst:text-blue-500">(رزومه)</span>
        </Link>

        {/* Schedule & Timing Info */}
        <div className="flex items-center gap-4 text-xs text-[var(--neo-text-muted)] mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{sessions} جلسه</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>شروع: {format(startDate, 'd MMMM')}</span>
          </div>
        </div>

        {/* Price & Action Button Footer */}
        <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-lg font-mono">
              {isFree ? (
                <span className="text-emerald-600 font-sans">رایگان</span>
              ) : (
                <div className="flex flex-col">
                  {hasDiscount ? (
                    <>
                      <span className="text-[var(--neo-text-muted)] text-xs line-through font-mono">
                        {price.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className="text-[var(--neo-primary)] font-mono">
                        {finalPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal font-sans text-gray-500">تومان</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-[var(--neo-primary)] font-mono">
                      {finalPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal font-sans text-gray-500">تومان</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            <Link
              href={linkHref}
              className="text-xs text-[var(--neo-text-secondary)] font-medium group-hover:text-[var(--neo-primary)] transition flex items-center gap-1"
            >
              <span>مشاهده کلاس</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
