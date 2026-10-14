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
    <div className="group bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full text-right">
      
      {/* 1. Class Image Poster Frame (Aspect 16/9, no overflow, contained border) */}
      <Link href={linkHref} className="relative aspect-video w-full overflow-hidden bg-slate-900 block shrink-0">
        <img
          src={getImageUrl(cls.coverImage || cls.thumbnail, 'class', cls.title)}
          alt={cls.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => handleImageError(e, 'class', cls.title)}
        />

        {/* Minimal Unobtrusive Badges on Top of Image */}
        {/* RTL Right Corner (Start): Online / In-person Mode */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black shadow-sm backdrop-blur-md flex items-center gap-1.5 ${
            isOnline 
              ? 'bg-blue-600/90 text-white' 
              : 'bg-emerald-600/90 text-white'
          }`}>
            {isOnline ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'کلاس آنلاین (Live)' : 'کارگاه حضوری'}</span>
          </span>
        </div>

        {/* RTL Left Corner (End): Public/Private or Deposit */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-end">
          {cls.allowPreRegistration ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/95 text-white shadow-sm backdrop-blur-xs">
              پیش‌ثبت‌نام بیعانه
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-white/95 text-slate-800 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-xs">
              {cls.type === 'private' ? 'خصوصی' : 'عمومی'}
            </span>
          )}
        </div>
      </Link>

      {/* 2. Card Body Content */}
      <div className="p-5 flex flex-col flex-grow text-right">
        
        {/* Status & Rating Bar (Outside image so it never covers visual content) */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusBadge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} animate-pulse`} />
            <span>{statusBadge.label}</span>
          </span>

          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{Number(rating).toFixed(1)}</span>
          </div>
        </div>

        {/* Title */}
        <Link href={linkHref} className="block mb-2">
          <h3 className="font-black text-base sm:text-lg text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors line-clamp-2 leading-snug">
            {cls.title}
          </h3>
        </Link>

        {/* Schedule & Timing Info */}
        <div className="space-y-1.5 text-xs text-[var(--neo-text-secondary)] mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>شروع: <span className="font-bold text-gray-800">{format(startDate, 'd MMMM yyyy')}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="line-clamp-1">
              {sessions} جلسه
              {cls.scheduleDays && cls.scheduleDays.length > 0 && ` • ${cls.scheduleDays.slice(0, 3).join('، ')}`}
              {cls.scheduleTime && ` • ساعت ${cls.scheduleTime}`}
            </span>
          </div>
        </div>

        {/* Instructor Info (Square Avatar, No Distortion) */}
        <div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-[var(--neo-border)]">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-gray-200 shrink-0 aspect-square">
            {instructorAvatar ? (
              <img
                src={getImageUrl(instructorAvatar, 'avatar', instructorName)}
                alt={instructorName}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, 'avatar', instructorName)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                <Users className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-gray-800 line-clamp-1">
              {instructorName}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 mt-3 border-t border-[var(--neo-border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block">شهریه کلاس</span>
            {isFree ? (
              <span className="font-black text-emerald-600 text-sm">رایگان</span>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-base text-[var(--neo-primary)] font-mono">
                  {finalPrice.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] text-gray-500 font-normal">تومان</span>
                {hasDiscount && (
                  <span className="text-[11px] text-gray-400 line-through font-mono mr-1">
                    {price.toLocaleString('fa-IR')}
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[var(--neo-primary)]/10 hover:bg-[var(--neo-primary)] text-[var(--neo-primary)] hover:text-white font-bold text-xs transition-colors"
          >
            <span>مشاهده</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
