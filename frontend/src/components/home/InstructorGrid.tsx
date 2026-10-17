'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { InstructorCard } from '@/components/instructors/InstructorCard';

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
              {data.map((inst: any) => (
                <SwiperSlide key={inst._id} className="h-auto">
                  <InstructorCard instructor={inst} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
