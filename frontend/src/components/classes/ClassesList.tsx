'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Search, MapPin, Monitor, Clock, Users, Calendar, Filter, ChevronDown, SlidersHorizontal, ArrowLeft, Star, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns-jalali';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function ClassesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-based state
  const getParam = (key: string) => searchParams.get(key) || '';
  
  const [searchTerm, setSearchTerm] = useState(getParam('q'));
  const [modeFilter, setModeFilter] = useState(getParam('mode') || 'all');
  const [typeFilter, setTypeFilter] = useState(getParam('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(getParam('status') || 'all');
  const [sortParam, setSortParam] = useState(getParam('sort') || 'newest');

  // Sync URL when state changes (debounced for search)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set('q', searchTerm); else params.delete('q');
    if (modeFilter !== 'all') params.set('mode', modeFilter); else params.delete('mode');
    if (typeFilter !== 'all') params.set('type', typeFilter); else params.delete('type');
    if (statusFilter !== 'all') params.set('status', statusFilter); else params.delete('status');
    if (sortParam !== 'newest') params.set('sort', sortParam); else params.delete('sort');
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, modeFilter, typeFilter, statusFilter, sortParam, pathname, router, searchParams]);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(res => res.data.data)
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8">
        <div className="w-64 hidden lg:block flex-shrink-0 animate-pulse bg-white rounded-2xl h-[600px] border border-[var(--neo-border)]"></div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm h-80"></div>
          ))}
        </div>
      </div>
    );
  }

  let filteredClasses = classes?.filter((cls: any) => {
    const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === 'all' || cls.mode === modeFilter;
    const matchesType = typeFilter === 'all' || cls.type === typeFilter;
    
    // Status Logic
    const now = new Date();
    const startDate = new Date(cls.startDate);
    const isStarted = startDate < now;
    // mock enrolled
    const enrolled = cls.enrolledCount || 0; 
    const isFull = enrolled >= cls.capacity;
    
    let clsStatus = 'open';
    if (cls.status === 'completed') clsStatus = 'completed';
    else if (cls.status === 'cancelled') clsStatus = 'cancelled';
    else if (isStarted) clsStatus = 'started';
    else if (isFull) clsStatus = 'full';

    const matchesStatus = statusFilter === 'all' || clsStatus === statusFilter;

    return matchesSearch && matchesMode && matchesType && matchesStatus;
  }) || [];

  // Sorting
  filteredClasses.sort((a: any, b: any) => {
    if (sortParam === 'newest') return new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime();
    if (sortParam === 'price_asc') return a.price - b.price;
    if (sortParam === 'price_desc') return b.price - a.price;
    if (sortParam === 'closest_start') {
      const diffA = Math.abs(new Date(a.startDate).getTime() - new Date().getTime());
      const diffB = Math.abs(new Date(b.startDate).getTime() - new Date().getTime());
      return diffA - diffB;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[var(--neo-bg)] pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 py-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">کلاس‌های آموزشی</h1>
          <p className="text-lg text-[var(--neo-text-muted)] max-w-2xl mx-auto">
            کلاس‌های حضوری، آنلاین، عمومی و خصوصی را پیدا و مقایسه کنید.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-[var(--neo-border)]">
            <span className="font-bold text-[var(--neo-text-main)]">فیلتر و جستجو</span>
            <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="p-2 bg-[var(--neo-surface-2)] rounded-lg text-[var(--neo-text-secondary)]">
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
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Mode Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">نوع برگزاری</h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'همه موارد' },
                    { id: 'online', label: 'آنلاین' },
                    { id: 'in_person', label: 'حضوری' }
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={modeFilter === opt.id}
                        onChange={() => setModeFilter(opt.id)}
                        className="w-4 h-4 text-[var(--neo-primary)] border-[var(--neo-border)] focus:ring-blue-500" 
                      />
                      <span className="text-sm text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-text-main)] transition">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">عمومی / خصوصی</h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'همه موارد' },
                    { id: 'public', label: 'عمومی' },
                    { id: 'private', label: 'خصوصی' }
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={typeFilter === opt.id}
                        onChange={() => setTypeFilter(opt.id)}
                        className="w-4 h-4 text-[var(--neo-primary)] border-[var(--neo-border)] focus:ring-blue-500" 
                      />
                      <span className="text-sm text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-text-main)] transition">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-sm">وضعیت ثبت‌نام</h3>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'همه موارد' },
                    { id: 'open', label: 'در حال ثبت‌نام' },
                    { id: 'full', label: 'تکمیل ظرفیت' },
                    { id: 'started', label: 'شروع شده' }
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="status" 
                        checked={statusFilter === opt.id}
                        onChange={() => setStatusFilter(opt.id)}
                        className="w-4 h-4 text-[var(--neo-primary)] border-[var(--neo-border)] focus:ring-blue-500" 
                      />
                      <span className="text-sm text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-text-main)] transition">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {/* Top Bar: Sort & Results Count */}
            <div className="bg-white p-4 rounded-xl border border-[var(--neo-border)] mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-[var(--neo-text-muted)]">
                نمایش <span className="font-bold text-[var(--neo-text-main)]">{filteredClasses.length}</span> کلاس
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-[var(--neo-text-muted)] hidden sm:block">مرتب‌سازی:</span>
                <select 
                  className="bg-[var(--neo-bg)] border border-[var(--neo-border)] text-[var(--neo-text-secondary)] text-sm rounded-lg focus:ring-blue-500 focus:border-[var(--neo-secondary)] block w-full p-2.5 outline-none"
                  value={sortParam}
                  onChange={(e) => setSortParam(e.target.value)}
                >
                  <option value="newest">جدیدترین</option>
                  <option value="closest_start">نزدیک‌ترین تاریخ شروع</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                  <option value="popular">محبوب‌ترین</option>
                </select>
              </div>
            </div>

            {/* Classes Grid */}
            {filteredClasses.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-[var(--neo-border)] flex flex-col items-center">
                <div className="w-16 h-16 bg-[var(--neo-bg)] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">نتیجه‌ای یافت نشد</h3>
                <p className="text-[var(--neo-text-muted)]">کلاسی با فیلترهای اعمال شده پیدا نشد. لطفاً فیلترها را تغییر دهید.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setModeFilter('all'); setTypeFilter('all'); setStatusFilter('all'); }}
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
            
            {/* Pagination Mock */}
            {filteredClasses.length > 0 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button className="w-10 h-10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-muted)] hover:bg-[var(--neo-bg)] hover:text-[var(--neo-text-main)] disabled:opacity-50">
                   <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-[var(--neo-primary)] text-white font-bold flex items-center justify-center">1</button>
                <button className="w-10 h-10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-secondary)] hover:bg-[var(--neo-bg)]">2</button>
                <button className="w-10 h-10 rounded-lg border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-muted)] hover:bg-[var(--neo-bg)] hover:text-[var(--neo-text-main)]">
                   <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: any }) {
  const isOnline = cls.mode === 'online';
  const instructor = cls.instructors?.[0];
  const startDate = cls.startDate ? new Date(cls.startDate) : new Date();
  
  // Mocks based on ID for consistency
  const enrolled = cls.enrolledCount || 0; 
  const isFull = enrolled >= cls.capacity;
  const isStarted = startDate < new Date();
  const remaining = cls.capacity - enrolled;
  
  // Rating mock
  const rating = cls.rating || 0;
  const sessions = cls.sessions || ((cls.title.length % 12) + 4); // 4 to 15 sessions
  
  let statusBadge = null;
  if (cls.status === 'completed') statusBadge = <span className="bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] px-2 py-1 rounded text-xs font-bold">پایان یافته</span>;
  else if (cls.status === 'cancelled') statusBadge = <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">لغو شده</span>;
  else if (isStarted) statusBadge = <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">شروع شده</span>;
  else if (isFull) statusBadge = <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold">ثبت‌نام تکمیل شده</span>;
  else if (remaining <= 3) statusBadge = <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">ظرفیت رو به اتمام ({remaining} نفر)</span>;
  
  return (
    <div className="bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:shadow-xl transition flex flex-col h-full group">
      <div className="relative h-48 bg-[var(--neo-surface-2)] overflow-hidden">
        <img src={`https://picsum.photos/seed/${cls._id}/600/400`} alt={cls.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur flex items-center gap-1 ${isOnline ? 'bg-[var(--neo-primary)]/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
            {isOnline ? <Monitor className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {isOnline ? 'آنلاین' : 'حضوری'}
          </span>
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-end">
          <span className="px-3 py-1 bg-white/90 text-[var(--neo-text-main)] rounded-full text-xs font-bold shadow-sm backdrop-blur">
            {cls.type === 'private' ? 'خصوصی' : 'عمومی'}
          </span>
        </div>
        {statusBadge && (
           <div className="absolute bottom-4 left-4 shadow-sm backdrop-blur">
             {statusBadge}
           </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="text-xs text-[var(--neo-text-muted)] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{sessions} جلسه</span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-[var(--neo-text-main)] mb-3 line-clamp-2 leading-tight">{cls.title}</h3>
        
        <div className="space-y-2.5 flex-grow text-sm text-[var(--neo-text-secondary)]">
          <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-[var(--neo-text-muted)] shrink-0" />
             <span>شروع: <span className="font-medium text-[var(--neo-text-main)]">{format(startDate, 'd MMMM yyyy')}</span></span>
          </div>
          <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-[var(--neo-text-muted)] shrink-0" />
             <span>روزهای فرد - ساعت ۱۷:۰۰</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
             <Users className="w-4 h-4 text-[var(--neo-text-muted)] shrink-0" />
             <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>ظرفیت: {cls.capacity}</span>
                  <span>{enrolled} ثبت‌نام</span>
                </div>
                <div className="w-full bg-[var(--neo-surface-2)] rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${isFull ? 'bg-rose-500' : remaining <= 3 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (enrolled / cls.capacity) * 100)}%` }}></div>
                </div>
             </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--neo-border)]">
          {instructor && (
            <div className="flex items-center gap-2 mb-4">
              <img src={instructor.avatar || `https://ui-avatars.com/api/?name=${instructor.firstName}+${instructor.lastName}`} className="w-6 h-6 rounded-full" alt="instructor" />
              <span className="text-xs font-medium text-[var(--neo-text-secondary)]">{instructor.firstName} {instructor.lastName}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="font-bold text-[var(--neo-primary)]">
              {cls.price === 0 ? 'رایگان' : `${cls.price.toLocaleString()} تومان`}
            </div>
            <Link href={`/classes/${cls.slug}`} className="px-4 py-2 bg-[var(--neo-primary)]/5 text-[var(--neo-primary)] rounded-lg text-sm font-bold hover:bg-[var(--neo-primary)] hover:text-white transition">
              مشاهده کلاس
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

