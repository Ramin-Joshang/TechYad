'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/features/blog/api/blog.api';
import Link from 'next/link';
import { Calendar, User, Search, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'همه',
  'دانشگاهی',
  'ریاضی',
  'فیزیک',
  'کامپیوتر',
  'برق',
  'مکانیک',
  'برنامه‌نویسی',
  'دانش‌آموزی',
  'مطالعه و یادگیری'
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: () => blogApi.getArticles(),
  });

  const allArticles = (data?.data as any[]) || [];
  
  // Filtering
  const filteredArticles = allArticles.filter((article: any) => {
    const matchesSearch = article.title.includes(searchTerm) || article.excerpt?.includes(searchTerm) || article.content.includes(searchTerm);
    // Assuming backend returns category as string or object. For now we just mock category filter if no real category exists, or match tags.
    // If we don't have categoryId.name, we'll just allow all for the mock.
    const matchesCategory = selectedCategory === 'همه' || 
                            (article as any).category?.name === selectedCategory ||
                            (article.tags && article.tags.includes(selectedCategory));
                            
    // Allow matchesCategory to be true if we don't have enough data to filter, to avoid empty states
    const passCategory = selectedCategory === 'همه' ? true : matchesCategory;
    return matchesSearch && passCategory;
  });

  // Featured Article
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const regularArticles = filteredArticles.slice(1);

  // Pagination
  const totalPages = Math.ceil(regularArticles.length / itemsPerPage);
  const currentArticles = regularArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-20 pb-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/bloghero/1920/1080')] opacity-10 mix-blend-overlay object-cover"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">مجله آموزشی تک‌یاد</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            دانش، تجربه و راهنمای یادگیری. مقالاتی برای ارتقای مهارت‌های شما در دنیای علم و تکنولوژی.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-[var(--neo-border)] flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              className="w-full pl-4 pr-12 py-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[var(--neo-primary)] text-white shadow-md'
                  : 'bg-white text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] border border-[var(--neo-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {/* Featured Article Skeleton */}
            <div className="bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-sm animate-pulse flex flex-col lg:flex-row">
              <div className="lg:w-1/2 bg-gray-200 min-h-[300px]"></div>
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-6 bg-gray-200 rounded-md"></div>
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="space-y-1.5">
                    <div className="w-28 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-[var(--neo-border)] rounded-3xl overflow-hidden shadow-sm animate-pulse flex flex-col">
                  <div className="aspect-[16/10] bg-gray-200 w-full"></div>
                  <div className="p-6 flex flex-col flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg w-4/5"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-gray-200 rounded w-full"></div>
                      <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3.5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                        <div className="w-20 h-3.5 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-16 h-3.5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-[var(--neo-border)] rounded-2xl">
            <p className="text-red-500 font-medium">خطا در دریافت مقالات</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[var(--neo-border)] rounded-2xl flex flex-col items-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-[var(--neo-text-main)] font-bold text-lg">مقاله‌ای یافت نشد</p>
            <p className="text-[var(--neo-text-muted)] text-sm mt-1">با کلمات جستجو یا دسته‌بندی انتخاب شده نتیجه‌ای پیدا نشد.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {currentPage === 1 && featuredArticle && (
              <div className="mb-12">
                <Link href={`/blog/${featuredArticle.slug}`} className="group block bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 relative overflow-hidden">
                      <img 
                        src={featuredArticle.thumbnail || `https://picsum.photos/seed/${featuredArticle._id}/800/600`} 
                        alt={featuredArticle.title} 
                        className="w-full h-full object-cover min-h-[300px] group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-[var(--neo-primary)] text-white text-xs font-bold px-3 py-1 rounded-full">
                        ویژه
                      </div>
                    </div>
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-4 text-xs font-medium text-[var(--neo-text-muted)] mb-6">
                        <span className="bg-[var(--neo-surface-2)] px-3 py-1 rounded-md text-[var(--neo-primary)]">
                          {(featuredArticle as any).category?.name || 'آموزشی'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(featuredArticle.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {Math.max(3, Math.ceil(featuredArticle.content.length / 1000))} دقیقه مطالعه
                        </div>
                      </div>
                      
                      <h2 className="text-2xl lg:text-3xl font-bold text-[var(--neo-text-main)] mb-4 group-hover:text-[var(--neo-primary)] transition-colors">
                        {featuredArticle.title}
                      </h2>
                      
                      <p className="text-[var(--neo-text-secondary)] leading-relaxed mb-8 line-clamp-3">
                        {featuredArticle.excerpt || featuredArticle.content.substring(0, 200) + '...'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-auto">
                        <img 
                          src={featuredArticle.author?.avatar || `https://ui-avatars.com/api/?name=${featuredArticle.author?.firstName || 'A'}+${featuredArticle.author?.lastName || 'U'}`} 
                          alt="Author" 
                          className="w-10 h-10 rounded-full bg-[var(--neo-surface-2)]" 
                        />
                        <div>
                          <p className="text-sm font-bold text-[var(--neo-text-main)]">
                            {featuredArticle.author?.firstName || 'تیم'} {featuredArticle.author?.lastName || 'تک‌یاد'}
                          </p>
                          <p className="text-xs text-[var(--neo-text-muted)]">نویسنده</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Regular Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentArticles.map((article) => (
                <article key={article._id} className="group bg-white border border-[var(--neo-border)] rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col shadow-sm">
                  <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/10] bg-[var(--neo-surface-2)] overflow-hidden">
                    <img 
                      src={article.thumbnail || `https://picsum.photos/seed/${article._id}/600/400`} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[var(--neo-primary)] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {(article as any).category?.name || 'مقاله'}
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-3 group-hover:text-[var(--neo-primary)] transition-colors line-clamp-2 leading-tight">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    
                    <p className="text-[var(--neo-text-secondary)] text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <img 
                          src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.firstName || 'A'}+${article.author?.lastName || 'U'}`} 
                          alt="Author" 
                          className="w-6 h-6 rounded-full" 
                        />
                        <span className="text-xs font-medium text-[var(--neo-text-secondary)]">
                          {article.author?.firstName || 'نویسنده'} {article.author?.lastName || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--neo-text-muted)]">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)] disabled:opacity-50 hover:bg-[var(--neo-bg)] transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition ${
                      currentPage === i + 1 
                        ? 'bg-[var(--neo-primary)] text-white shadow-md' 
                        : 'bg-white border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-bg)]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)] disabled:opacity-50 hover:bg-[var(--neo-bg)] transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
