'use client';

import { useState } from 'react';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

export function Testimonials({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  const [swiper, setSwiper] = useState<any>(null);

  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Swiper Controls */}
        <div dir="rtl" className="flex flex-row justify-between items-center sm:items-end mb-8 sm:mb-12 gap-3 text-right w-full">
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 justify-start">
              <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase truncate">
                داستان‌های موفقیت
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)] text-right truncate">
              نظرات دانشجویان تک‌یاد
            </h2>
          </div>

          {data.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[var(--neo-surface-2)] p-1 rounded-2xl border border-[var(--neo-border)] shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => swiper?.slidePrev()}
                aria-label="نظر قبلی"
                className="w-8 h-8 rounded-xl bg-white hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => swiper?.slideNext()}
                aria-label="نظر بعدی"
                className="w-8 h-8 rounded-xl bg-white hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-[var(--neo-surface)] border border-[var(--neo-border)] p-6 rounded-2xl animate-pulse">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--neo-border)]">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div dir="rtl">
            <Swiper
              onSwiper={setSwiper}
              modules={[Autoplay]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              spaceBetween={20}
              slidesPerView={1.15}
              grabCursor={true}
              breakpoints={{
                640: {
                  slidesPerView: 2.1,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              className="!overflow-visible"
            >
              {data.map((item: any, idx: number) => {
                const studentName = item.user?.firstName
                  ? `${item.user.firstName} ${item.user.lastName}`
                  : item.studentName || 'دانشجوی تک‌یاد';
                const avatarUrl = getImageUrl(item.user?.avatar || item.avatar, 'avatar', studentName);

                return (
                  <SwiperSlide key={item._id || idx} className="h-auto">
                    <div className="bg-[var(--neo-surface-2)] border border-[var(--neo-border)] p-6 rounded-2xl relative flex flex-col justify-between h-full hover:border-[var(--neo-primary)]/40 hover:shadow-md transition duration-300 text-right">
                      <Quote className="absolute top-5 left-5 w-10 h-10 text-[var(--neo-primary)] opacity-10 pointer-events-none" />

                      <div>
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 mb-4 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < (item.rating || 5) ? 'fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>

                        {/* Comment */}
                        <p className="text-[var(--neo-text-main)] text-sm leading-relaxed mb-6 font-medium line-clamp-4">
                          "{item.comment || item.content}"
                        </p>
                      </div>

                      {/* Student info */}
                      <div className="flex items-center gap-3 pt-4 border-t border-[var(--neo-border)]/80 mt-auto">
                        <div className="w-11 h-11 rounded-full border border-[var(--neo-border)] overflow-hidden bg-white shrink-0">
                          <img
                            src={avatarUrl}
                            alt={studentName}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, 'avatar', studentName)}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-[var(--neo-text-main)] truncate">
                            {studentName}
                          </div>
                          <div className="text-[11px] text-[var(--neo-text-secondary)] mt-0.5 truncate">
                            {item.course?.title || item.courseName || 'دانشجوی دوره‌های تخصصی'}
                          </div>
                        </div>
                      </div>
                    </div>
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
