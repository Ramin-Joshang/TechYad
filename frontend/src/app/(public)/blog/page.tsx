'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/features/blog/api/blog.api';
import Link from 'next/link';
import { 
  Calendar, User, Search, Clock, ChevronLeft, ChevronRight, 
  Sparkles, Filter, Mail, ArrowUpRight, BookOpen, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [readingTimeFilter, setReadingTimeFilter] = useState<'all' | 'quick' | 'medium' | 'deep'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'reading-time'>('newest');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const { data, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: () => blogApi.getArticles(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['publicBlogCategories'],
    queryFn: () => blogApi.getCategories(true),
  });

  const allArticles = (data?.data as any[]) || [];
  const realCategories = (categoriesData?.data as any[]) || [];
  const categoryNames = ['همه', ...realCategories.map((c: any) => c.name)];
  
  // Calculate reading time for each article
  const articlesWithMetrics = allArticles.map((a: any) => {
    const wordCount = (a.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 600;
    const readingTime = Math.max(2, Math.ceil(wordCount / 220));
    return { ...a, wordCount, readingTime };
  });

  // Filtering
  const filteredArticles = articlesWithMetrics.filter((article: any) => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (article.tags && article.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const catName = article.categoryId?.name || article.category?.name;
    const matchesCategory = selectedCategory === 'همه' || 
                            catName === selectedCategory ||
                            (article.tags && article.tags.includes(selectedCategory));

    let matchesTime = true;
    if (readingTimeFilter === 'quick') matchesTime = article.readingTime <= 5;
    else if (readingTimeFilter === 'medium') matchesTime = article.readingTime > 5 && article.readingTime <= 10;
    else if (readingTimeFilter === 'deep') matchesTime = article.readingTime > 10;
                            
    return matchesSearch && matchesCategory && matchesTime;
  });

  // Sorting
  const sortedArticles = [...filteredArticles].sort((a: any, b: any) => {
    if (sortBy === 'reading-time') return b.readingTime - a.readingTime;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Featured Article
  const featuredArticle = sortedArticles.length > 0 ? sortedArticles[0] : null;
  const regularArticles = sortedArticles.slice(1);

  // Pagination
  const totalPages = Math.ceil(regularArticles.length / itemsPerPage);
  const currentArticles = regularArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('لطفاً یک آدرس ایمیل معتبر وارد کنید');
      return;
    }
    toast.success('عضویت شما در خبرنامه تک‌یاد با موفقیت ثبت شد!');
    setNewsletterEmail('');
  };

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-20">
      
      {/* Hero Section */}
      <div className="bg-slate-900 pt-20 pb-28 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            مجله تخصصی و آموزشی تک‌یاد
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            دانش، تجربه و راهنمای یادگیری
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            مقالاتی دقیق و کاربردی از اساتید و متخصصان برجسته برای ارتقای مهارت‌های فردی و تخصصی در دنیای فناوری و علوم پایه.
          </p>
        </div>
      </div>

      {/* Search & Multi-Filters Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 mb-10">
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl border border-[var(--neo-border)] space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در مقالات، مفاهیم یا برچسب‌ها..."
                className="w-full pl-4 pr-12 py-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Reading Time Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> زمان:
              </span>
              <select
                value={readingTimeFilter}
                onChange={(e) => {
                  setReadingTimeFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full md:w-36 py-2.5 px-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">همه زمان‌ها</option>
                <option value="quick">زیر ۵ دقیقه (سریع)</option>
                <option value="medium">۵ تا ۱۰ دقیقه</option>
                <option value="deep">بیش از ۱۰ دقیقه (عمیق)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <span className="text-xs font-bold text-slate-500 shrink-0">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full md:w-36 py-2.5 px-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="newest">جدیدترین مقالات</option>
                <option value="reading-time">بیشترین محتوا</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        
        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-[var(--neo-border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-12">
            <div className="bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-sm animate-pulse flex flex-col lg:flex-row">
              <div className="lg:w-1/2 bg-gray-200 min-h-[300px]"></div>
              <div className="lg:w-1/2 p-8 space-y-4">
                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-8 bg-gray-200 rounded-xl w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : sortedArticles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-xs text-slate-500 mb-6">
              متأسفانه مقاله‌ای مطابق با فیلترها و کلمه جستجو شده پیدا نشد. می‌توانید فیلترها را ریست کنید.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('همه');
                setReadingTimeFilter('all');
              }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              مشاهده تمام مقالات
            </button>
          </div>
        ) : (
          <>
            {/* Featured Article Card */}
            {currentPage === 1 && featuredArticle && (
              <div className="bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-7/12 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-100">
                    <img 
                      src={featuredArticle.thumbnail || `https://picsum.photos/seed/${featuredArticle._id}/900/600`} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      مقاله ویژه و منتخب
                    </div>
                  </div>
                  
                  <div className="lg:w-5/12 p-8 sm:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                          {(featuredArticle.categoryId || featuredArticle.category)?.name || 'آموزش تخصصی'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredArticle.readingTime} دقیقه مطالعه
                        </span>
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        <Link href={`/blog/${featuredArticle.slug}`}>
                          {featuredArticle.title}
                        </Link>
                      </h2>
                      
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt || featuredArticle.content?.replace(/<[^>]*>/g, '').substring(0, 160) + '...'}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={(featuredArticle.authorId || featuredArticle.author)?.personnelPhoto || (featuredArticle.authorId || featuredArticle.author)?.avatar || `https://ui-avatars.com/api/?name=Author&background=0284c7&color=fff`} 
                          alt="Author" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {(featuredArticle.authorId || featuredArticle.author)?.firstName || 'تیم'} {(featuredArticle.authorId || featuredArticle.author)?.lastName || 'تک‌یاد'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(featuredArticle.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </div>

                      <Link 
                        href={`/blog/${featuredArticle.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition"
                      >
                        مطالعه کامل
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {currentArticles.map((article: any) => (
                <article 
                  key={article._id} 
                  className="bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  <Link href={`/blog/${article.slug}`} className="aspect-[16/10] overflow-hidden bg-slate-100 relative block">
                    <img 
                      src={article.thumbnail || `https://picsum.photos/seed/${article._id}/600/400`} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {article.readingTime} دقیقه
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg inline-block">
                        {(article.categoryId || article.category)?.name || 'عمومی'}
                      </span>
                      
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                        <Link href={`/blog/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>
                      
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                        {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 130) + '...'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <img 
                          src={(article.authorId || article.author)?.personnelPhoto || (article.authorId || article.author)?.avatar || `https://ui-avatars.com/api/?name=Author&background=0284c7&color=fff`} 
                          alt="" 
                          className="w-6 h-6 rounded-full object-cover border border-slate-200" 
                        />
                        <span className="text-[11px] font-medium text-slate-700">
                          {(article.authorId || article.author)?.firstName || 'تیم'} {(article.authorId || article.author)?.lastName || 'تک‌یاد'}
                        </span>
                      </div>
                      <span className="text-[11px]">
                        {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-2xl border border-[var(--neo-border)] bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                      currentPage === i + 1 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-white border border-[var(--neo-border)] text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-2xl border border-[var(--neo-border)] bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Newsletter Subscription Box */}
            <div className="bg-gradient-to-l from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-white/10 mt-14">
              <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
                <div className="inline-flex p-3 bg-blue-500/20 rounded-2xl text-blue-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black">عضویت در خبرنامه هفتگی تک‌یاد</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  جدیدترین مقالات علمی، نکات برنامه‌نویسی و کدهای تخفیف دوره‌های جدید هر هفته مستقیماً به ایمیل شما ارسال می‌شود.
                </p>
                <form onSubmit={handleSubscribeNewsletter} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="آدرس ایمیل شما (مثلاً user@gmail.com)"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-blue-400 backdrop-blur-xs"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>عضویت</span>
                    <Send className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </form>
              </div>
            </div>

          </>
        )}
      </main>
    </div>
  );
}
