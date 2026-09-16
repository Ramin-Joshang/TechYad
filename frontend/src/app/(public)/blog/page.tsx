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
    <div className="bg-gray-50 min-h-screen pb-20">
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
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="جستجو در مقالات..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-gray-500">درحال بارگذاری مقالات...</div>
        ) : error ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <p className="text-red-500 font-medium">خطا در دریافت مقالات</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl flex flex-col items-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-900 font-bold text-lg">مقاله‌ای یافت نشد</p>
            <p className="text-gray-500 text-sm mt-1">با کلمات جستجو یا دسته‌بندی انتخاب شده نتیجه‌ای پیدا نشد.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {currentPage === 1 && featuredArticle && (
              <div className="mb-12">
                <Link href={`/blog/${featuredArticle.slug}`} className="group block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2 relative overflow-hidden">
                      <img 
                        src={featuredArticle.thumbnail || `https://picsum.photos/seed/${featuredArticle._id}/800/600`} 
                        alt={featuredArticle.title} 
                        className="w-full h-full object-cover min-h-[300px] group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ویژه
                      </div>
                    </div>
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                        <span className="bg-gray-100 px-3 py-1 rounded-md text-blue-600">
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
                      
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {featuredArticle.title}
                      </h2>
                      
                      <p className="text-gray-600 leading-relaxed mb-8 line-clamp-3">
                        {featuredArticle.excerpt || featuredArticle.content.substring(0, 200) + '...'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-auto">
                        <img 
                          src={featuredArticle.author?.avatar || `https://ui-avatars.com/api/?name=${featuredArticle.author?.firstName || 'A'}+${featuredArticle.author?.lastName || 'U'}`} 
                          alt="Author" 
                          className="w-10 h-10 rounded-full bg-gray-100" 
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {featuredArticle.author?.firstName || 'تیم'} {featuredArticle.author?.lastName || 'تک‌یاد'}
                          </p>
                          <p className="text-xs text-gray-500">نویسنده</p>
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
                <article key={article._id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col shadow-sm">
                  <Link href={`/blog/${article.slug}`} className="block relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img 
                      src={article.thumbnail || `https://picsum.photos/seed/${article._id}/600/400`} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {(article as any).category?.name || 'مقاله'}
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {article.excerpt || article.content.substring(0, 150) + '...'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <img 
                          src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.firstName || 'A'}+${article.author?.lastName || 'U'}`} 
                          alt="Author" 
                          className="w-6 h-6 rounded-full" 
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {article.author?.firstName || 'نویسنده'} {article.author?.lastName || ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
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
                  className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition ${
                      currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition"
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
