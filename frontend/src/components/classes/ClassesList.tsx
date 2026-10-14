'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Search, MapPin, Monitor, Clock, Users, Calendar, Filter, ChevronDown, SlidersHorizontal, ArrowLeft, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns-jalali';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getImageUrl, handleImageError } from '@/lib/utils';
import { ClassCard } from './ClassCard';

export function ClassesList({ initialData }: { initialData?: any } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [modeFilter, setModeFilter] = useState(searchParams.get('mode') || 'all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortParam, setSortParam] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Function to push filter updates to URL & reset page when filter changes
  const updateFilters = (newFilters: {
    q?: string;
    mode?: string;
    type?: string;
    status?: string;
    sort?: string;
    page?: number;
  }) => {
    const nextQ = newFilters.q !== undefined ? newFilters.q : searchTerm;
    const nextMode = newFilters.mode !== undefined ? newFilters.mode : modeFilter;
    const nextType = newFilters.type !== undefined ? newFilters.type : typeFilter;
    const nextStatus = newFilters.status !== undefined ? newFilters.status : statusFilter;
    const nextSort = newFilters.sort !== undefined ? newFilters.sort : sortParam;
    const nextPage = newFilters.page !== undefined ? newFilters.page : 1;

    if (newFilters.q !== undefined) setSearchTerm(nextQ);
    if (newFilters.mode !== undefined) setModeFilter(nextMode);
    if (newFilters.type !== undefined) setTypeFilter(nextType);
    if (newFilters.status !== undefined) setStatusFilter(nextStatus);
    if (newFilters.sort !== undefined) setSortParam(nextSort);
    setPage(nextPage);

    const params = new URLSearchParams();
    if (nextQ) params.set('q', nextQ);
    if (nextMode !== 'all') params.set('mode', nextMode);
    if (nextType !== 'all') params.set('type', nextType);
    if (nextStatus !== 'all') params.set('status', nextStatus);
    if (nextSort !== 'newest') params.set('sort', nextSort);
    if (nextPage > 1) params.set('page', nextPage.toString());

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Fetch classes from backend with pagination & filters
  const { data: responseData, isLoading: queryLoading } = useQuery({
    queryKey: ['classes', { searchTerm, modeFilter, typeFilter, sortParam, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (modeFilter !== 'all') params.set('mode', modeFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (sortParam) params.set('sort', sortParam);
      params.set('page', page.toString());
      params.set('limit', '8');

      const res: any = await api.get(`/classes?${params.toString()}`);
      return res.data;
    },
    initialData: initialData,
  });

  const resolvedData = responseData || initialData;
  const isLoading = !resolvedData ? queryLoading : false;
  const rawClasses = resolvedData?.classes || (Array.isArray(resolvedData) ? resolvedData : []);
  const total = resolvedData?.total ?? rawClasses.length;
  const totalPages = resolvedData?.pages || 1;
  const currentPage = resolvedData?.page || page;

  // Filter status client-side (open, full, started, completed, cancelled)
  const filteredClasses = rawClasses.filter((cls: any) => {
    if (statusFilter === 'all') return true;
    const now = new Date();
    const startDate = new Date(cls.startDate);
    const isStarted = startDate < now;
    const enrolled = cls.enrolledCount || 0;
    const isFull = enrolled >= cls.capacity;

    let clsStatus = 'open';
    if (cls.status === 'completed') clsStatus = 'completed';
    else if (cls.status === 'cancelled') clsStatus = 'cancelled';
    else if (isStarted) clsStatus = 'started';
    else if (isFull) clsStatus = 'full';

    return clsStatus === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[var(--neo-bg)] pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">کلاس‌های آموزشی</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            کلاس‌های حضوری، آنلاین، عمومی و خصوصی را پیدا و مقایسه کنید.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--neo-border)]">
            <span className="font-bold text-[var(--neo-text-main)]">فیلتر و جستجو</span>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-2 bg-[var(--neo-surface-2)] rounded-lg text-[var(--neo-text-secondary)]"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Filters */}
          <div className={`lg:w-72 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-2xl border border-[var(--neo-border)] sticky top-24 space-y-8">
              {/* Search */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">جستجو</h3>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="نام کلاس..."
                    className="w-full pl-3 pr-10 py-2.5 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => updateFilters({ q: e.target.value, page: 1 })}
                  />
                </div>
              </div>

              {/* Mode Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">نوع برگزاری</h3>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100/80 rounded-xl">
                  {[
                    { id: 'all', label: 'همه' },
                    { id: 'online', label: 'آنلاین' },
                    { id: 'in_person', label: 'حضوری' }
                  ].map((opt) => {
                    const isActive = modeFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFilters({ mode: opt.id, page: 1 })}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                          isActive
                            ? 'bg-white text-[var(--neo-primary)] shadow-sm'
                            : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">نوع کلاس</h3>
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100/80 rounded-xl">
                  {[
                    { id: 'all', label: 'همه' },
                    { id: 'public', label: 'عمومی' },
                    { id: 'private', label: 'خصوصی' }
                  ].map((opt) => {
                    const isActive = typeFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFilters({ type: opt.id, page: 1 })}
                        className={`py-2 px-2 text-xs font-semibold rounded-lg transition text-center ${
                          isActive
                            ? 'bg-white text-[var(--neo-primary)] shadow-sm'
                            : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">وضعیت ثبت‌نام</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'همه وضعیت‌ها' },
                    { id: 'open', label: 'در حال ثبت‌نام' },
                    { id: 'full', label: 'تکمیل ظرفیت' },
                    { id: 'started', label: 'شروع شده' },
                    { id: 'completed', label: 'پایان یافته' }
                  ].map((opt) => {
                    const isActive = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateFilters({ status: opt.id, page: 1 })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                          isActive
                            ? 'bg-[var(--neo-primary)] text-white border-[var(--neo-primary)] shadow-sm'
                            : 'bg-white text-[var(--neo-text-secondary)] border-[var(--neo-border)] hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchTerm || modeFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all' || sortParam !== 'newest') && (
                <button
                  onClick={() => {
                    updateFilters({ q: '', mode: 'all', type: 'all', status: 'all', sort: 'newest', page: 1 });
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-[var(--neo-text-secondary)] text-sm font-medium rounded-lg transition"
                >
                  پاک کردن همه فیلترها
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar: Sort & Results Count */}
            <div className="bg-white p-4 rounded-xl border border-[var(--neo-border)] mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-[var(--neo-text-muted)]">
                {isLoading ? (
                  <span>در حال دریافت کلاس‌ها...</span>
                ) : (
                  <span>
                    نمایش <span className="font-bold text-[var(--neo-text-main)]">{filteredClasses.length}</span> از <span className="font-bold text-[var(--neo-text-main)]">{total}</span> کلاس
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-[var(--neo-text-muted)] hidden sm:block">مرتب‌سازی:</span>
                <select
                  className="bg-[var(--neo-bg)] border border-[var(--neo-border)] text-[var(--neo-text-secondary)] text-sm rounded-lg focus:ring-blue-500 focus:border-[var(--neo-secondary)] block w-full p-2.5 outline-none"
                  value={sortParam}
                  onChange={(e) => updateFilters({ sort: e.target.value, page: 1 })}
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                </select>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden flex flex-col h-[450px]">
                    <div className="h-48 bg-gray-200 w-full"></div>
                    <div className="p-5 flex flex-col flex-grow space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                      <div className="space-y-2 flex-grow pt-2">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                      </div>
                      <div className="pt-4 border-t border-[var(--neo-border)] flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                        <div className="h-9 bg-gray-100 rounded-lg w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-[var(--neo-border)] flex flex-col items-center">
                <div className="w-16 h-16 bg-[var(--neo-bg)] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">نتیجه‌ای یافت نشد</h3>
                <p className="text-[var(--neo-text-muted)]">کلاسی با فیلترهای اعمال شده پیدا نشد. لطفاً فیلترها را تغییر دهید.</p>
                <button
                  onClick={() => updateFilters({ q: '', mode: 'all', type: 'all', status: 'all', sort: 'newest', page: 1 })}
                  className="mt-6 px-6 py-2 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] font-medium rounded-lg hover:bg-[var(--neo-primary)]/10 transition"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredClasses.map((cls: any) => (
                  <ClassCard key={cls._id} cls={cls} />
                ))}
              </div>
            )}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  className="w-10 h-10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-muted)] hover:bg-[var(--neo-bg)] hover:text-[var(--neo-text-main)] disabled:opacity-40 disabled:cursor-not-allowed bg-white transition"
                  aria-label="Previous Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pNum = i + 1;
                  const isActive = currentPage === pNum;
                  return (
                    <button
                      key={pNum}
                      onClick={() => updateFilters({ page: pNum })}
                      className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition ${
                        isActive
                          ? 'bg-[var(--neo-primary)] text-white shadow-sm'
                          : 'border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-bg)] bg-white'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  className="w-10 h-10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-muted)] hover:bg-[var(--neo-bg)] hover:text-[var(--neo-text-main)] disabled:opacity-40 disabled:cursor-not-allowed bg-white transition"
                  aria-label="Next Page"
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
