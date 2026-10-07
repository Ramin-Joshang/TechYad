'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Search, Filter, Clock, Book, User, Star, CheckSquare, Square, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toEnDigits } from '@/lib/utils';

interface CourseListContainerProps {
  initialData?: any;
  initialCategories?: any[];
  initialLevels?: any[];
  initialInstructors?: any[];
}

export function CourseListContainer({
  initialData,
  initialCategories,
  initialLevels,
  initialInstructors,
}: CourseListContainerProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subject: searchParams.get('subject') || '',
    field: searchParams.get('field') || '',
    level: searchParams.get('level') || '',
    instructor: searchParams.get('instructor') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isFree: searchParams.get('isFree') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1')
  });

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state to URL only when user changes filters
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    if (!hasInteracted) return;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    router.replace(`/courses?${params.toString()}`);
  }, [filters, router, hasInteracted]);

  const handleFilterChange = (key: string, value: any) => {
    setHasInteracted(true);
    setFilters(prev => ({ ...prev, [key]: value, page: key === 'page' ? value : 1 }));
  };

  const clearFilters = () => {
    setHasInteracted(true);
    setFilters({
      search: '', category: '', subject: '', field: '', level: '', instructor: '',
      minPrice: '', maxPrice: '', isFree: false, sort: 'newest', page: 1
    });
  };

  // Fetch filter options from working endpoints
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((res: any) => res.data || []),
    initialData: initialCategories,
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: () => api.get('/levels').then((res: any) => res.data || []),
    initialData: initialLevels,
  });

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => api.get('/instructors').then((res: any) => res.data || []),
    initialData: initialInstructors,
  });

  // Fetch courses with backend pagination
  const { data: coursesData, isLoading: queryLoading, isError } = useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value.toString());
      });
      if (!params.has('limit')) params.set('limit', '9');
      const res: any = await api.get(`/courses?${params.toString()}`);
      return res.data;
    },
    initialData: initialData,
  });

  const resolvedData = coursesData || initialData;
  const isLoading = !resolvedData ? queryLoading : false;

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--neo-text-main)]">دوره‌های آموزشی</h1>
            <p className="text-[var(--neo-text-muted)] mt-2">بهترین دوره‌ها برای ارتقای مهارت‌های شما</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <input 
                type="text" 
                placeholder="جستجو..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--neo-border)] focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--neo-text-muted)]" />
            </div>
            <button 
              className="md:hidden p-2 rounded-lg border border-[var(--neo-border)] text-[var(--neo-text-secondary)] bg-white"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Backdrop */}
          {isMobileFiltersOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity" 
              onClick={() => setIsMobileFiltersOpen(false)} 
            />
          )}

          {/* Sidebar Filters */}
          <div className={`
            fixed inset-y-0 right-0 z-50 bg-white p-6 overflow-y-auto w-full max-w-xs sm:max-w-sm transform transition-transform duration-300 ease-in-out shadow-2xl
            lg:relative lg:inset-auto lg:translate-x-0 lg:w-1/4 lg:block lg:bg-transparent lg:p-0 lg:z-auto lg:shadow-none
            ${isMobileFiltersOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex justify-between items-center lg:hidden mb-6">
              <h2 className="text-xl font-bold">فیلترها</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)}>
                <X className="h-6 w-6 text-[var(--neo-text-muted)]" />
              </button>
            </div>

            <div className="bg-white lg:rounded-2xl lg:shadow-sm lg:border border-[var(--neo-border)] p-6 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[var(--neo-primary)]" /> فیلترها
                </h3>
                <button onClick={clearFilters} className="text-sm text-[var(--neo-primary)] hover:underline">پاک کردن همه</button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold text-[var(--neo-text-main)] mb-3 text-sm">دسته‌بندی</h4>
                <select 
                  className="w-full p-2 border border-[var(--neo-border)] rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">همه دسته‌ها</option>
                  {categories?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <h4 className="font-semibold text-[var(--neo-text-main)] mb-3 text-sm">سطح دوره</h4>
                <select 
                  className="w-full p-2 border border-[var(--neo-border)] rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  <option value="">همه سطوح</option>
                  {levels?.map((l: any) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div>
                <h4 className="font-semibold text-[var(--neo-text-main)] mb-3 text-sm">مدرس</h4>
                <select 
                  className="w-full p-2 border border-[var(--neo-border)] rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.instructor}
                  onChange={(e) => handleFilterChange('instructor', e.target.value)}
                >
                  <option value="">همه مدرسین</option>
                  {instructors?.map((i: any) => (
                    <option key={i._id || i.userId?._id} value={i.userId?._id || i._id}>
                      {i.userId ? `${i.userId.firstName} ${i.userId.lastName}` : (i.title || 'مدرس')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold text-[var(--neo-text-main)] mb-3 text-sm">محدوده قیمت (تومان)</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="از" 
                    className="w-1/2 p-2 border border-[var(--neo-border)] rounded-lg text-sm bg-white dir-ltr text-left"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', toEnDigits(e.target.value).replace(/[^0-9]/g, ''))}
                  />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="تا" 
                    className="w-1/2 p-2 border border-[var(--neo-border)] rounded-lg text-sm bg-white dir-ltr text-left"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', toEnDigits(e.target.value).replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              {/* Free courses only */}
              <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleFilterChange('isFree', !filters.isFree)}>
                {filters.isFree ? <CheckSquare className="w-5 h-5 text-[var(--neo-primary)]" /> : <Square className="w-5 h-5 text-[var(--neo-text-muted)]" />}
                <span className="text-sm font-medium text-[var(--neo-text-secondary)]">فقط دوره‌های رایگان</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 flex flex-col">
            
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--neo-border)] mb-6 flex justify-between items-center">
              <span className="text-sm text-[var(--neo-text-secondary)]">
                {isLoading ? 'در حال جستجو...' : `${coursesData?.total || coursesData?.courses?.length || 0} دوره یافت شد`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--neo-text-secondary)]">مرتب‌سازی:</span>
                <select 
                  className="text-sm border-none bg-transparent font-medium text-[var(--neo-text-main)] cursor-pointer focus:ring-0 outline-none"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden animate-pulse flex flex-col">
                    <div className="aspect-[16/10] bg-gray-200 w-full"></div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-center mb-3">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-100 rounded w-12"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                      </div>
                      <div className="flex gap-4 mb-4">
                        <div className="h-3 bg-gray-100 rounded w-16"></div>
                        <div className="h-3 bg-gray-100 rounded w-16"></div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between">
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                        <div className="h-9 bg-gray-100 rounded-lg w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center border border-red-100">
                خطا در دریافت اطلاعات. لطفا دوباره تلاش کنید.
              </div>
            ) : (resolvedData?.courses?.length || 0) === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[var(--neo-border)] text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[var(--neo-text-muted)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">دوره‌ای یافت نشد</h3>
                <p className="text-[var(--neo-text-muted)]">با تغییر فیلترها دوباره تلاش کنید.</p>
                <button onClick={clearFilters} className="mt-6 text-[var(--neo-primary)] font-medium hover:underline">
                  حذف فیلترها
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {resolvedData?.courses?.map((course: any) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(resolvedData?.pages || 0) > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button 
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--neo-border)] disabled:opacity-50 hover:bg-[var(--neo-bg)] bg-white transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {[...Array(coursesData.pages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => handleFilterChange('page', i + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition ${filters.page === i + 1 ? 'bg-[var(--neo-primary)] text-white' : 'border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-bg)] bg-white'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={filters.page === coursesData.pages}
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--neo-border)] disabled:opacity-50 hover:bg-[var(--neo-bg)] bg-white transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const router = useRouter();
  const isFree = course.price === 0;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const instructor = course.instructors?.[0];
  const instructorName = instructor ? `${instructor.firstName} ${instructor.lastName}` : 'استاد تک‌یاد';

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:shadow-xl hover:shadow-[var(--neo-primary)]/5 transition duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
        <img src={course.thumbnail || `https://picsum.photos/seed/${course.slug}/400/250`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute top-4 right-4 flex flex-wrap gap-2">
          {course.categoryId?.name && (
            <div className="bg-white/90 backdrop-blur text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full">
              {course.categoryId.name}
            </div>
          )}
          {course.isRegistrationOpen === false && (
            <div className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
              ثبت‌نام بسته شد
            </div>
          )}
        </div>
        {hasDiscount && !isFree && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round((1 - course.discountPrice / course.price) * 100)}% تخفیف
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span>{course.averageRating || 'جدید'}</span>
            <span className="text-[var(--neo-text-muted)] font-normal">({course.reviewCount || 0})</span>
          </div>
          {course.levelId?.name && (
             <span className="text-xs text-[var(--neo-primary)] bg-[var(--neo-primary)]/5 px-2 py-1 rounded-md">{course.levelId.name}</span>
          )}
        </div>
        
        <h3 className="font-bold text-[var(--neo-text-main)] mb-2 line-clamp-2 group-hover:text-[var(--neo-primary)] transition">{course.title}</h3>
        
        <div 
          onClick={(e) => {
            if (instructor?._id) {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/instructors/${instructor._id}`);
            }
          }}
          className="flex items-center gap-2 mb-4 text-xs text-[var(--neo-text-muted)] hover:text-blue-600 transition w-fit cursor-pointer group/inst"
          title="مشاهده رزومه و دوره‌های استاد"
        >
          <img 
            src={instructor?.personnelPhoto || instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructorName)}&background=0284c7&color=fff`} 
            className="w-6 h-6 rounded-full object-cover border border-slate-200" 
            alt={instructorName} 
          />
          <span className="truncate font-medium">{instructorName}</span>
          <span className="text-[10px] text-slate-400 group-hover/inst:text-blue-500">(رزومه)</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-[var(--neo-text-muted)] mb-4">
          <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> {course.totalDuration ? Math.round(course.totalDuration / 60) + ' ساعت' : 'نامشخص'}</div>
          <div className="flex items-center gap-1"><User className="w-4 h-4"/> {course.studentCount || 0} دانشجو</div>
        </div>

        <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-lg font-mono">
              {isFree ? (
                <span className="text-emerald-600 font-sans">رایگان</span>
              ) : (
                <div className="flex flex-col">
                  {hasDiscount ? (
                    <>
                      <span className="text-[var(--neo-text-muted)] text-xs line-through">{course.price.toLocaleString('fa-IR')} تومان</span>
                      <span className="text-[var(--neo-primary)]">{course.discountPrice.toLocaleString('fa-IR')} <span className="text-xs font-normal font-sans">تومان</span></span>
                    </>
                  ) : (
                    <span className="text-[var(--neo-primary)]">{course.price.toLocaleString('fa-IR')} <span className="text-xs font-normal font-sans">تومان</span></span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`w-full py-2 font-medium rounded-lg transition-colors text-center text-sm ${
            course.isRegistrationOpen === false
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-[var(--neo-bg)] group-hover:bg-[var(--neo-primary)] group-hover:text-white text-[var(--neo-primary)]'
          }`}>
            {course.isRegistrationOpen === false ? 'مشاهده (ثبت‌نام بسته)' : 'مشاهده دوره'}
          </div>
        </div>
      </div>
    </Link>
  );
}
