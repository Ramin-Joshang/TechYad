"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { getImageUrl, handleImageError } from "@/lib/utils";
import { ClassCard } from "@/components/classes/ClassCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

export function CourseList({
  title,
  data = [],
  sectionName = "Explore",
  isLoading = false,
}: {
  title: string;
  data?: any[];
  sectionName?: string;
  isLoading?: boolean;
}) {
  const [swiper, setSwiper] = useState<any>(null);

  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-10 sm:py-16 bg-[var(--neo-bg)] border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title, View All, and Swiper Controls */}
        <div
          dir="rtl"
          className="flex flex-row justify-between items-center sm:items-end mb-6 sm:mb-10 gap-3 text-right w-full"
        >
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 justify-start">
              <span className="w-6 sm:w-8 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase truncate">
                {sectionName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)] text-right truncate">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Swiper Navigation Buttons */}
            {data.length > 1 && (
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[var(--neo-border)] shadow-2xs">
                <button
                  type="button"
                  onClick={() => swiper?.slidePrev()}
                  aria-label="اسلاید قبلی"
                  className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => swiper?.slideNext()}
                  aria-label="اسلاید بعدی"
                  className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-[var(--neo-primary)] hover:text-white text-gray-700 flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              href={title.includes("کلاس") ? "/classes" : "/courses"}
              className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-bold inline-flex items-center gap-1 text-xs sm:text-sm shrink-0 px-3 py-1.5 rounded-xl bg-white border border-[var(--neo-border)] hover:border-[var(--neo-primary)] shadow-2xs whitespace-nowrap"
            >
              <span>مشاهده همه</span>
              <span>←</span>
            </Link>
          </div>
        </div>

        {/* Carousel Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-[var(--neo-border)] rounded-2xl animate-pulse overflow-hidden"
              >
                <div className="aspect-[16/10] bg-gray-200 w-full" />
                <div className="p-4 flex flex-col flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-4/5 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="mt-auto pt-3 border-t border-[var(--neo-border)] flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div dir="rtl" className="w-full overflow-hidden">
            <Swiper
              onSwiper={setSwiper}
              modules={[Autoplay]}
              autoplay={false}
              spaceBetween={20}
              slidesPerView={1}
              grabCursor={true}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="w-full overflow-hidden"
            >
              {data.map((item: any) => {
                const isClass =
                  item.mode !== undefined ||
                  item.capacity !== undefined ||
                  item.scheduleDays !== undefined;
                const linkHref = isClass
                  ? `/classes/${item.slug || item._id}`
                  : `/courses/${item.slug || item._id}`;
                const instructorObj = item.instructor || item.instructors?.[0];
                const instructorName =
                  typeof instructorObj === "object" && instructorObj !== null
                    ? `${instructorObj.firstName || ""} ${instructorObj.lastName || ""}`.trim() ||
                      instructorObj.name
                    : typeof item.instructor === "string"
                      ? item.instructor
                      : "استاد تک یاد";
                const instructorAvatar =
                  instructorObj?.personnelPhoto || instructorObj?.avatar;
                const isFree = item.price === 0;
                const hasDiscount =
                  item.discountPrice && item.discountPrice < item.price;
                const displayPrice = hasDiscount
                  ? item.discountPrice
                  : item.price;

                if (isClass) {
                  return (
                    <SwiperSlide key={item._id} className="h-auto">
                      <ClassCard cls={item} />
                    </SwiperSlide>
                  );
                }

                return (
                  <SwiperSlide key={item._id} className="h-auto">
                    <Link
                      href={linkHref}
                      className="group flex flex-col h-full overflow-hidden bg-white border border-[var(--neo-border)] rounded-2xl hover:border-[var(--neo-primary)]/40 hover:shadow-lg transition-all duration-300 text-right"
                    >
                      {/* Thumbnail Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
                        <img
                          src={getImageUrl(
                            item.thumbnail || item.coverImage,
                            "course",
                            item.title,
                          )}
                          onError={(e) =>
                            handleImageError(e, "course", item.title)
                          }
                          alt={item.title}
                          className="w-full h-full object-fill group-hover:scale-105 transition duration-500 ease-out"
                        />

                        {/* Badges Overlay */}
                        <div className="absolute top-2.5 right-2.5 z-20 flex flex-wrap gap-1.5">
                          {isFree && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              رایگان
                            </span>
                          )}
                          {item.mode === "online" && (
                            <span className="bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                              آنلاین (Live)
                            </span>
                          )}
                          {item.mode === "in_person" && (
                            <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                              حضوری
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex flex-col flex-grow text-right">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[var(--neo-text-muted)] text-[10px] font-medium bg-[var(--neo-surface-2)] px-2 py-0.5 rounded-md">
                            {item.categoryId?.name ||
                              item.category?.name ||
                              (isClass ? "کلاس آنلاین" : "دوره تخصصی")}
                          </span>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>
                              {item.averageRating || item.rating
                                ? Number(
                                    item.averageRating || item.rating,
                                  ).toFixed(1)
                                : "5.0"}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-[var(--neo-text-main)] mb-2 text-sm line-clamp-2 leading-relaxed group-hover:text-[var(--neo-primary)] transition-colors">
                          {item.title}
                        </h3>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 mb-3.5 mt-auto">
                          <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 overflow-hidden border border-purple-100 shrink-0">
                            {instructorAvatar ? (
                              <img
                                src={getImageUrl(
                                  instructorAvatar,
                                  "avatar",
                                  instructorName,
                                )}
                                onError={(e) =>
                                  handleImageError(e, "avatar", instructorName)
                                }
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <Users className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-xs text-[var(--neo-text-secondary)] font-medium line-clamp-1">
                            {instructorName}
                          </span>
                        </div>

                        {/* Price & Sessions Footer */}
                        <div className="pt-2.5 border-t border-[var(--neo-border)] flex items-center justify-between">
                          <span className="text-[11px] text-[var(--neo-text-muted)]">
                            {isClass
                              ? `${item.sessions || 10} جلسه`
                              : `${item.totalLessons || 12} درس`}
                          </span>

                          <div className="font-bold text-xs sm:text-sm text-[var(--neo-primary)] font-mono text-left dir-ltr">
                            {isFree ? (
                              <span className="text-emerald-600">رایگان</span>
                            ) : (
                              <span>
                                {displayPrice.toLocaleString("fa-IR")}{" "}
                                <span className="text-[10px] text-gray-500 font-normal">
                                  تومان
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
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
