'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, GraduationCap, Layers, Star, Users, Clock, 
  Calendar, MapPin, Video, Sparkles, Filter, ChevronDown, Check, ArrowRight 
} from 'lucide-react';
import { CategoryBreadcrumb, BreadcrumbItem } from './CategoryBreadcrumb';
import { CategoryCard } from './CategoryCard';

interface CategoryPageClientProps {
  category: any;
  breadcrumbs: BreadcrumbItem[];
  children: any[];
  initialCourses: any[];
  initialClasses: any[];
  totalCourses: number;
  totalClasses: number;
}

export function CategoryPageClient({
  category,
  breadcrumbs,
  children,
  initialCourses,
  initialClasses,
  totalCourses,
  totalClasses,
}: CategoryPageClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'classes'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc'>('newest');

  // Filter courses
  const filteredCourses = initialCourses.filter((course) => {
    if (priceFilter === 'free' && course.price > 0) return false;
    if (priceFilter === 'paid' && course.price === 0) return false;
    return true;
  });

  // Filter classes
  const filteredClasses = initialClasses.filter((cls) => {
    if (priceFilter === 'free' && cls.price > 0) return false;
    if (priceFilter === 'paid' && cls.price === 0) return false;
    return true;
  });

  const showCourses = activeTab === 'all' || activeTab === 'courses';
  const showClasses = activeTab === 'all' || activeTab === 'classes';

  const hasAnyContent = (filteredCourses.length > 0 && showCourses) || (filteredClasses.length > 0 && showClasses);

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--neo-bg)] text-right pb-24">
      {/* 1. Header & Hero Area */}
      <section className="bg-gradient-to-b from-white to-[var(--neo-surface-2)]/40 border-b border-[var(--neo-border)] pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <CategoryBreadcrumb items={breadcrumbs} currentTitle={category.name} />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>دسته‌بندی تخصصی آموزشی</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--neo-text-main)] tracking-tight">
                دوره‌ها و کلاس‌های {category.name}
              </h1>
              {category.description ? (
                <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed font-normal">
                  {category.description}
                </p>
              ) : (
                <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] leading-relaxed font-normal">
                  مجموعه جامع دوره‌های آموزشی ویدیویی، کارگاه‌های زنده و کلاس‌های تعاملی در شاخه {category.name} با برترین اساتید ایران
                </p>
              )}
            </div>

            {/* Quick Stats Chips */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-5 py-3 rounded-2xl bg-white border border-[var(--neo-border)] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[var(--neo-primary)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[var(--neo-text-muted)] font-medium">دوره‌ها</div>
                  <div className="text-lg font-black text-[var(--neo-text-main)]">{totalCourses}</div>
                </div>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-white border border-[var(--neo-border)] shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[var(--neo-text-muted)] font-medium">کلاس‌ها</div>
                  <div className="text-lg font-black text-[var(--neo-text-main)]">{totalClasses}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Subcategories / Child Category Navigation (Section 7) */}
      {children && children.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[var(--neo-border)] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--neo-text-secondary)]">
              <Layers className="w-4 h-4 text-[var(--neo-primary)]" />
              <span>زیردسته‌های تخصصی {category.name}:</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {children.map((child: any) => (
                <CategoryCard key={child._id} category={child} variant="pill" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Main Content Area with Filters & Grids */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Filter Bar & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs">
          {/* Content Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--neo-surface-2)] rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-[var(--neo-primary)] shadow-xs'
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              همه محتواها ({totalCourses + totalClasses})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses'
                  ? 'bg-white text-[var(--neo-primary)] shadow-xs'
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دوره‌ها ({totalCourses})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'classes'
                  ? 'bg-white text-[var(--neo-primary)] shadow-xs'
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>کلاس‌ها ({totalClasses})</span>
            </button>
          </div>

          {/* Price Filter Options */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[var(--neo-text-muted)] bg-[var(--neo-surface-2)]/60 px-2 py-1 rounded-lg">
              <Filter className="w-3.5 h-3.5" />
              <span>هزینه:</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'free', 'paid'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    priceFilter === p
                      ? 'bg-[var(--neo-primary)] text-white shadow-xs'
                      : 'bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-border)]'
                  }`}
                >
                  {p === 'all' ? 'همه' : p === 'free' ? 'رایگان' : 'نقدی'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State Check */}
        {!hasAnyContent ? (
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[var(--neo-surface-2)] text-[var(--neo-text-muted)] flex items-center justify-center mx-auto border border-[var(--neo-border)]">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[var(--neo-text-main)]">
              هنوز دوره یا کلاسی در این دسته‌بندی منتشر نشده است
            </h3>
            <p className="text-sm text-[var(--neo-text-secondary)] max-w-md mx-auto leading-relaxed">
              تیم محتوای تک‌یاد به زودی دوره‌ها و کارگاه‌های جدیدی در شاخه {category.name} منتشر خواهد کرد. می‌توانید سایر شاخه‌ها را بررسی کنید.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/categories"
                className="px-5 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white font-bold text-xs sm:text-sm hover:opacity-95 transition"
              >
                مشاهده همه دسته‌بندی‌ها
              </Link>
              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] font-bold text-xs sm:text-sm hover:bg-[var(--neo-border)] transition"
              >
                مشاهده دوره‌های آموزشی
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* 4. Classes Section */}
            {showClasses && filteredClasses.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--neo-border)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
                      کلاس‌های آنلاین و حضوری {category.name}
                    </h2>
                  </div>
                  <Link
                    href={`/classes?category=${category.slug}`}
                    className="text-xs sm:text-sm text-[var(--neo-primary)] font-bold hover:underline"
                  >
                    مشاهده در صفحه کلاس‌ها ←
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClasses.map((item) => {
                    const instructor = item.instructors?.[0] || item.instructor;
                    const instructorName = instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() : 'استاد تک‌یاد';
                    const isFree = item.price === 0;
                    const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                    const displayPrice = hasDiscount ? item.discountPrice : item.price;

                    return (
                      <Link
                        key={item._id}
                        href={`/classes/${item.slug || item._id}`}
                        className="group flex flex-col bg-white rounded-2xl border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative aspect-[16/10] bg-[var(--neo-surface-2)] overflow-hidden">
                          <img
                            src={item.thumbnail || `https://picsum.photos/seed/${item.slug || item._id}/600/380`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {item.mode === 'online' ? (
                              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                آنلاین (Live)
                              </span>
                            ) : (
                              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                حضوری {item.city ? `(${item.city})` : ''}
                              </span>
                            )}
                            {item.allowPreRegistration && (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                پیش‌ثبت‌نام
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-base text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[var(--neo-text-muted)]">
                              <Users className="w-3.5 h-3.5" />
                              <span>{instructorName}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[var(--neo-border)]/60 flex items-center justify-between text-xs">
                            <div className="text-[var(--neo-text-muted)] flex items-center gap-2">
                              <span>{item.sessions || 10} جلسه</span>
                              {item.scheduleTime && <span>• {item.scheduleTime}</span>}
                            </div>
                            <div className="font-bold text-sm text-[var(--neo-primary)] font-mono">
                              {isFree ? (
                                <span className="text-emerald-600">رایگان</span>
                              ) : (
                                <span>{displayPrice.toLocaleString('fa-IR')} تومان</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 5. Courses Section */}
            {showCourses && filteredCourses.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--neo-border)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
                      دوره‌های آموزشی ویدیویی {category.name}
                    </h2>
                  </div>
                  <Link
                    href={`/courses?category=${category.slug}`}
                    className="text-xs sm:text-sm text-[var(--neo-primary)] font-bold hover:underline"
                  >
                    مشاهده در صفحه دوره‌ها ←
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((item) => {
                    const instructor = item.instructors?.[0] || item.instructor;
                    const instructorName = instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() : 'استاد تک‌یاد';
                    const isFree = item.price === 0;
                    const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                    const displayPrice = hasDiscount ? item.discountPrice : item.price;

                    return (
                      <Link
                        key={item._id}
                        href={`/courses/${item.slug || item._id}`}
                        className="group flex flex-col bg-white rounded-2xl border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="relative aspect-[16/10] bg-[var(--neo-surface-2)] overflow-hidden">
                          <img
                            src={item.thumbnail || item.coverImage || `https://picsum.photos/seed/${item.slug || item._id}/600/380`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {isFree ? (
                              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                رایگان
                              </span>
                            ) : hasDiscount ? (
                              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                تخفیف ویژه
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-base text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-[var(--neo-text-muted)]">
                              <span className="line-clamp-1">{instructorName}</span>
                              <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{item.averageRating ? Number(item.averageRating).toFixed(1) : '5.0'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[var(--neo-border)]/60 flex items-center justify-between text-xs">
                            <div className="text-[var(--neo-text-muted)] flex items-center gap-2">
                              <span>{item.totalLessons || 12} درس</span>
                              {item.studentCount !== undefined && (
                                <span>• {item.studentCount} دانشجو</span>
                              )}
                            </div>
                            <div className="font-bold text-sm text-[var(--neo-primary)] font-mono">
                              {isFree ? (
                                <span className="text-emerald-600">رایگان</span>
                              ) : (
                                <span>{displayPrice.toLocaleString('fa-IR')} تومان</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
