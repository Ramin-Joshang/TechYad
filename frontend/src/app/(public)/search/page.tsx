'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search as SearchIcon, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Loader2, 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Calendar,
  X,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { searchApi, SearchResult } from '@/features/search/api/search.api';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'classes' | 'instructors' | 'blog'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);

  // Instant Suggestions dropdown state
  const [suggestions, setSuggestions] = useState<SearchResult | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputContainerRef = useRef<HTMLDivElement>(null);

  // Debounced instant suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions(null);
      setIsSuggesting(false);
      return;
    }

    setIsSuggesting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.globalSearch(trimmed);
        setSuggestions(res.data);
      } catch (e) {
        console.error('Error fetching suggestions:', e);
      } finally {
        setIsSuggesting(false);
      }
    }, 350); // 350ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputContainerRef.current && !searchInputContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const res = await searchApi.globalSearch(searchQuery);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) {
      performSearch(initialQuery);
    } else {
      setResults(null);
    }
  }, [initialQuery]);

  const hasSearched = !!initialQuery;

  const coursesCount = results?.courses?.length || 0;
  const classesCount = results?.classes?.length || 0;
  const instructorsCount = results?.instructors?.length || 0;
  const articlesCount = results?.articles?.length || 0;
  const totalCount = coursesCount + classesCount + instructorsCount + articlesCount;

  const TABS = [
    { id: 'all', label: 'همه نتایج', count: totalCount },
    { id: 'courses', label: 'دوره‌ها', count: coursesCount },
    { id: 'classes', label: 'کلاس‌ها', count: classesCount },
    { id: 'instructors', label: 'اساتید', count: instructorsCount },
    { id: 'blog', label: 'مقالات وبلاگ', count: articlesCount },
  ];

  // Render Courses section
  const renderCourses = () => {
    if (!results?.courses?.length) return null;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--neo-primary)]" />
          <span>دوره‌های آموزشی ({results.courses.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.courses.map(course => (
            <Link 
              key={course._id} 
              href={`/courses/${course.slug}`} 
              className="bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img 
                  src={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/250`} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                  دوره آموزشی
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--neo-primary)] transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
                  <div className="text-xs text-gray-500">
                    {course.instructors?.[0] ? `${course.instructors[0].firstName} ${course.instructors[0].lastName}` : 'مدرس تک‌یاد'}
                  </div>
                  <div className="font-bold text-[var(--neo-primary)]">
                    {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Render Classes section
  const renderClasses = () => {
    if (!results?.classes?.length) return null;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          <span>کلاس‌های آنلاین و حضوری ({results.classes.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.classes.map(cls => (
            <Link 
              key={cls._id} 
              href={`/classes/${cls.slug}`} 
              className="bg-white rounded-2xl border border-[var(--neo-border)] overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img 
                  src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/250`} 
                  alt={cls.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm ${
                  cls.mode === 'online' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition">
                    {cls.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {cls.description}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
                  <div className="text-xs text-gray-500">
                    ظرفیت: {cls.enrolledCount || 0} از {cls.capacity || 'نامحدود'}
                  </div>
                  <div className="font-bold text-purple-600">
                    {cls.price === 0 ? 'رایگان' : `${cls.price.toLocaleString('fa-IR')} تومان`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  // Render Instructors section
  const renderInstructors = () => {
    if (!results?.instructors?.length) return null;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>اساتید و مدرسین ({results.instructors.length})</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.instructors.map(inst => {
            const user = inst.userId || {};
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'استاد تک‌یاد';
            const avatar = user.avatar || inst.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;
            const profileId = inst._id || user._id;

            return (
              <Link 
                key={inst._id} 
                href={`/instructors/${profileId}`}
                className="bg-white rounded-2xl border border-[var(--neo-border)] p-5 shadow-sm hover:shadow-lg transition-all group flex items-start gap-4"
              >
                <div className="relative shrink-0">
                  <img 
                    src={avatar} 
                    alt={fullName} 
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-200 group-hover:ring-2 group-hover:ring-[var(--neo-primary)] transition"
                  />
                  {inst.rating && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-bold text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{inst.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-[var(--neo-primary)] transition truncate">
                    {fullName}
                  </h3>
                  <div className="text-xs text-[var(--neo-primary)] font-medium truncate mt-0.5">
                    {inst.title || 'مدرس ارشد پلتفرم'}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                    {inst.bio || 'متخصص و مدرس باتجربه در زمینه توسعه نرم‌افزار و فناوری.'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Articles section
  const renderArticles = () => {
    if (!results?.articles?.length) return null;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>مقالات وبلاگ ({results.articles.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.articles.map(article => (
            <Link 
              key={article._id} 
              href={`/blog/${article.slug || article._id}`} 
              className="bg-white rounded-2xl border border-[var(--neo-border)] p-4 hover:shadow-lg transition-all flex gap-4 items-start group"
            >
              <img 
                src={article.thumbnail || 'https://picsum.photos/seed/blog/200/200'} 
                alt={article.title} 
                className="w-24 h-24 object-cover rounded-xl shrink-0 group-hover:scale-105 transition duration-300" 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-emerald-600 transition text-sm">
                  {article.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span>{(article.authorId || article.author) ? `${(article.authorId || article.author).firstName || ""} ${(article.authorId || article.author).lastName || ""}`.trim() || "تیم تحریریه" : "تیم تحریریه"}</span>\n                  <span>•</span>
                  <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const hasNoResults = results && totalCount === 0;

  return (
    <main className="bg-[var(--neo-bg)] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Input Box with Live Suggestions */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)] mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-5 h-5 text-[var(--neo-primary)]" />
            <h1 className="text-2xl font-bold text-gray-900">جستجوی هوشمند در تک‌یاد</h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            دوره‌ها، کلاس‌های آنلاین و حضوری، اساتید متخصص و مقالات بلاگ را در یک نگاه جستجو کنید.
          </p>

          <div ref={searchInputContainerRef} className="relative max-w-3xl">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
              
              <input 
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="نام دوره، کلاس، استاد یا موضوع مورد نظر خود را بنویسید..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-14 pl-36 py-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:bg-white transition shadow-sm"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions(null);
                  }}
                  className="absolute left-28 sm:left-32 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition"
                  title="پاک کردن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button 
                type="submit"
                disabled={isSearching}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--neo-primary)] hover:bg-blue-700 text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-70 flex items-center gap-2 shadow-md shadow-[var(--neo-primary)]/20 text-sm"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'جستجو'}
              </button>
            </form>

            {/* Live Autocomplete / Suggestions Dropdown */}
            {showSuggestions && query.trim().length >= 2 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {isSuggesting ? (
                  <div className="p-6 text-center text-gray-400 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--neo-primary)]" />
                    <span className="text-sm">در حال پیدا کردن پیشنهادات مرتبط...</span>
                  </div>
                ) : suggestions && (
                  (suggestions.courses.length > 0 || 
                   suggestions.classes.length > 0 || 
                   suggestions.instructors.length > 0 || 
                   suggestions.articles.length > 0) ? (
                    <div className="p-3 space-y-4">
                      
                      {/* Instructor suggestions */}
                      {suggestions.instructors?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-blue-600 px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>اساتید ({suggestions.instructors.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {suggestions.instructors.slice(0, 3).map(inst => {
                              const user = inst.userId || {};
                              const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'استاد تک‌یاد';
                              return (
                                <Link
                                  key={inst._id}
                                  href={`/instructors/${inst._id || user._id}`}
                                  onClick={() => setShowSuggestions(false)}
                                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50/70 transition group"
                                >
                                  <img 
                                    src={user.avatar || inst.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} 
                                    alt={name}
                                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-xs text-gray-900 group-hover:text-blue-600 truncate">{name}</div>
                                    <div className="text-[11px] text-gray-500 truncate">{inst.title || 'مدرس تک‌یاد'}</div>
                                  </div>
                                  <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Course suggestions */}
                      {suggestions.courses?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-[var(--neo-primary)] px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>دوره‌های آموزشی ({suggestions.courses.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {suggestions.courses.slice(0, 3).map(course => (
                              <Link
                                key={course._id}
                                href={`/courses/${course.slug}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition group"
                              >
                                <img 
                                  src={course.thumbnail || `https://picsum.photos/seed/${course._id}/100/100`} 
                                  alt={course.title}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs text-gray-900 group-hover:text-[var(--neo-primary)] truncate">{course.title}</div>
                                  <div className="text-[11px] text-gray-500 truncate">{course.price === 0 ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}</div>
                                </div>
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-[var(--neo-primary)]" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Class suggestions */}
                      {suggestions.classes?.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-purple-600 px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" />
                            <span>کلاس‌ها ({suggestions.classes.length})</span>
                          </div>
                          <div className="space-y-1 mt-1">
                            {suggestions.classes.slice(0, 3).map(cls => (
                              <Link
                                key={cls._id}
                                href={`/classes/${cls.slug}`}
                                onClick={() => setShowSuggestions(false)}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/70 transition group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                  <Video className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs text-gray-900 group-hover:text-purple-600 truncate">{cls.title}</div>
                                  <div className="text-[11px] text-gray-500 truncate">{cls.mode === 'online' ? 'کلاس آنلاین' : 'کلاس حضوری'}</div>
                                </div>
                                <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View all button in dropdown */}
                      <button
                        onClick={() => handleSearch()}
                        className="w-full mt-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                      >
                        <span>مشاهده همه نتایج برای «{query}»</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      پیشنهادی برای این عبارت یافت نشد. برای جستجوی عمیق‌تر دکمه اینتر را بزنید.
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Filter Tabs */}
          {hasSearched && results && !hasNoResults && (
            <div className="flex items-center gap-2 mt-8 border-b border-[var(--neo-border)] overflow-x-auto pb-2 scrollbar-none">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-[var(--neo-primary)] text-white shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="space-y-8">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-12 h-12 text-[var(--neo-primary)] animate-spin mb-4" />
                <p className="text-gray-500">در حال جستجوی گسترده برای «{initialQuery}»...</p>
              </div>
            ) : hasNoResults ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-[var(--neo-border)] text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-6">
                  <SearchIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">نتیجه‌ای یافت نشد!</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  متاسفانه برای عبارت «{initialQuery}» هیچ دوره، کلاس، استاد یا مقاله‌ای پیدا نشد. لطفاً املای عبارت را چک کنید یا کلمات کلیدی دیگری را جستجو نمایید.
                </p>
                <button 
                  onClick={() => { setQuery(''); router.push('/search'); }}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
                >
                  پاک کردن جستجو
                </button>
              </div>
            ) : (
              <div>
                {(activeTab === 'all' || activeTab === 'instructors') && renderInstructors()}
                {(activeTab === 'all' || activeTab === 'courses') && renderCourses()}
                {(activeTab === 'all' || activeTab === 'classes') && renderClasses()}
                {(activeTab === 'all' || activeTab === 'blog') && renderArticles()}

                {activeTab === 'instructors' && results?.instructors.length === 0 && (
                  <p className="text-gray-400 text-center py-10">هیچ استادی با این مشخصات یافت نشد.</p>
                )}
                {activeTab === 'courses' && results?.courses.length === 0 && (
                  <p className="text-gray-400 text-center py-10">هیچ دوره‌ای با این عنوان یافت نشد.</p>
                )}
                {activeTab === 'classes' && results?.classes.length === 0 && (
                  <p className="text-gray-400 text-center py-10">هیچ کلاسی با این عنوان یافت نشد.</p>
                )}
                {activeTab === 'blog' && results?.articles.length === 0 && (
                  <p className="text-gray-400 text-center py-10">هیچ مقاله‌ای با این عنوان یافت نشد.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state (before search) */}
        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 text-[var(--neo-primary)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">دوره‌های آموزشی</h3>
              <p className="text-xs text-gray-500 leading-relaxed">دوره‌های ویدیویی پروژه‌محور از صفر تا صد.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">کلاس‌های آنلاین و حضوری</h3>
              <p className="text-xs text-gray-500 leading-relaxed">کلاس‌های تعاملی با ارتباط زنده و رفع اشکال.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">اساتید برتر</h3>
              <p className="text-xs text-gray-500 leading-relaxed">متخصصان و مدرسان باسابقه در حوزه‌های تخصصی.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">مقالات تخصصی</h3>
              <p className="text-xs text-gray-500 leading-relaxed">نکات، آموزش‌های سریع و راهنماهای کاربردی وبلاگ.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--neo-bg)]">
        <Loader2 className="w-12 h-12 text-[var(--neo-primary)] animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
