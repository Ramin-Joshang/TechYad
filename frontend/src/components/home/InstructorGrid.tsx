'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

export function InstructorGrid({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  const [swiper, setSwiper] = useState<any>(null);

  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-12 sm:py-20 bg-white border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div dir="rtl" className="flex flex-row justify-between items-center sm:items-end mb-6 sm:mb-10 gap-3 text-right w-full">
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 justify-start">
              <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase truncate">
                اساتید و مدرسان برتر
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)] text-right truncate">
              تجربه یادگیری از بهترین‌ها
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {data.length > 1 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[var(--neo-surface-2)] p-1 rounded-2xl border border-[var(--neo-border)] shadow-2xs">
                <button
                  type="button"
                  onClick={() => swiper?.slidePrev()}
                  aria-label="استاد قبلی"
                  className="w-8 h-8 rounded-xl bg-white hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => swiper?.slideNext()}
                  aria-label="استاد بعدی"
                  className="w-8 h-8 rounded-xl bg-white hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              href="/instructors"
              className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-bold inline-flex items-center gap-1 text-xs sm:text-sm shrink-0 px-3 py-1.5 rounded-xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] hover:border-[var(--neo-primary)] shadow-2xs whitespace-nowrap"
            >
              <span>همه اساتید</span>
              <span>←</span>
            </Link>
          </div>
        </div>

        {/* Carousel Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-[var(--neo-bg)] rounded-2xl border border-[var(--neo-border)] p-5 animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl bg-gray-200 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-20 mb-4" />
                <div className="h-5 bg-gray-100 rounded-full w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div dir="rtl">
            <Swiper
              onSwiper={setSwiper}
              modules={[Autoplay]}
              autoplay={false}
              spaceBetween={20}
              slidesPerView={1.2}
              grabCursor={true}
              breakpoints={{
                480: {
                  slidesPerView: 1.35,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 18,
                },
                1024: {
                  slidesPerView: 3.2,
                  spaceBetween: 22,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="!overflow-visible"
            >
              {data.map((inst: any) => {
                const instId = inst.slug || inst.userId?.slug || inst.userId?._id || inst._id;
                const fullName = inst.userId
                  ? `${inst.userId.firstName || ''} ${inst.userId.lastName || ''}`.trim()
                  : 'استاد تک‌یاد';
                const avatarUrl = getImageUrl(
                  inst.userId?.personnelPhoto || inst.personnelPhoto || inst.userId?.avatar || inst.avatar,
                  'avatar',
                  fullName
                );
                const specialties = inst.specialties || inst.expertise || [];

                return (
                  <SwiperSlide key={inst._id} className="h-auto">
                    <Link
                      href={`/instructors/${instId}`}
                      className="group bg-[var(--neo-bg)] rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/40 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-center"
                    >
                      <div className="aspect-square relative overflow-hidden bg-[var(--neo-surface-2)] m-3.5 rounded-xl">
                        <img
                          src={avatarUrl}
                          onError={(e) => handleImageError(e, 'avatar', fullName)}
                          alt={fullName}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      <div className="p-4 pt-1 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="font-bold text-[var(--neo-text-main)] mb-1 text-sm sm:text-base group-hover:text-[var(--neo-primary)] transition-colors line-clamp-1">
                            {fullName}
                          </h3>
                          <div className="flex items-center justify-center gap-1 text-[var(--neo-text-secondary)] text-xs mb-3">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="line-clamp-1">
                              {inst.title || inst.userId?.specialty || 'مدرس ارشد تک‌یاد'}
                            </span>
                          </div>
                        </div>

                        {specialties.length > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-auto pt-2.5 border-t border-[var(--neo-border)]/60">
                            {specialties.slice(0, 2).map((exp: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)]"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
