'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, BookOpen, Video, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { searchApi, SearchResult } from '@/features/search/api/search.api';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'classes' | 'blog'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchApi.globalSearch(searchQuery);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const hasSearched = !!initialQuery;

  const TABS = [
    { id: 'all', label: 'همه نتایج' },
    { id: 'courses', label: 'دوره‌های آموزشی', count: results?.courses?.length || 0 },
    { id: 'classes', label: 'کلاس‌ها', count: results?.classes?.length || 0 },
    { id: 'blog', label: 'مقالات', count: results?.articles?.length || 0 },
  ];

  const renderCourses = () => {
    if (!results?.courses?.length) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> دوره‌های آموزشی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.courses.map(course => (
            <Link key={course._id} href={`/courses/${course.slug}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition flex flex-col">
              <img src={course.thumbnail || 'https://picsum.photos/seed/course/400/250'} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-blue-600">{course.price === 0 ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderArticles = () => {
    if (!results?.articles?.length) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" /> مقالات آموزشی
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.articles.map(article => (
            <Link key={article._id} href={`/blog/${article.slug}`} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition flex gap-4 items-start">
              <img src={article.thumbnail || 'https://picsum.photos/seed/blog/200/200'} alt={article.title} className="w-24 h-24 object-cover rounded-xl shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{article.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{article.excerpt}</p>
                <span className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const hasNoResults = results && results.courses.length === 0 && results.classes.length === 0 && results.articles.length === 0;

  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">جستجو در تک‌یاد</h1>
          <form onSubmit={handleSearch} className="relative max-w-3xl">
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="دنبال چه چیزی می‌گردید؟ (مثلا: پایتون، ری‌اکت، هوش مصنوعی)"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-14 pl-32 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition disabled:opacity-70 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'جستجو'}
            </button>
          </form>

          {/* Tabs */}
          {hasSearched && results && !hasNoResults && (
            <div className="flex items-center gap-2 mt-8 border-b border-gray-100 overflow-x-auto pb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.id !== 'all' && <span className="bg-white px-2 py-0.5 rounded-md text-xs">{tab.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-8">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500">در حال جستجو برای «{initialQuery}»...</p>
              </div>
            ) : hasNoResults ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-6">
                  <SearchIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">نتیجه‌ای یافت نشد!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  متاسفانه برای عبارت «{initialQuery}» نتیجه‌ای پیدا نکردیم. لطفاً املای کلمه را بررسی کنید یا از کلمات کلیدی دیگری استفاده نمایید.
                </p>
                <button 
                  onClick={() => { setQuery(''); router.push('/search'); }}
                  className="mt-8 px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  پاک کردن جستجو
                </button>
              </div>
            ) : (
              <div>
                {(activeTab === 'all' || activeTab === 'courses') && renderCourses()}
                {(activeTab === 'all' || activeTab === 'blog') && renderArticles()}
                {activeTab === 'classes' && results?.classes.length === 0 && (
                  <p className="text-gray-500 text-center py-10">هیچ کلاسی یافت نشد.</p>
                )}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">جستجو در دوره‌ها</h3>
              <p className="text-sm text-gray-500">بیش از ۱۰۰ دوره آموزشی تخصصی با پروژه‌های عملی.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">جستجو در کلاس‌ها</h3>
              <p className="text-sm text-gray-500">کلاس‌های آنلاین و حضوری با برترین اساتید.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">جستجو در مقالات</h3>
              <p className="text-sm text-gray-500">هزاران مقاله آموزشی رایگان و به‌روز در بلاگ.</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
