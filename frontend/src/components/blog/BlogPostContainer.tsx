'use client';

import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/features/blog/api/blog.api';
import { coursesApi } from '@/features/courses/api/courses.api';
import { 
  Calendar, Tag, BookOpen, Clock, ChevronLeft, MessageSquare, 
  ThumbsUp, Send, Link as LinkIcon, Bookmark, Heart, Share2, 
  Sparkles, Check, Type, Headphones, Eye, ArrowUp, CornerDownLeft
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface CommentItem {
  id: string;
  name: string;
  avatar?: string;
  date: string;
  text: string;
  likes: number;
}

export function BlogPostContainer({ slug }: { slug: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [likesCount, setLikesCount] = useState(24);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      name: 'مهدی رضایی',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      date: '۲ روز پیش',
      text: 'بسیار عالی و کاربردی بود. به خصوص بخش پیاده‌سازی گام‌به‌گام که دقیقا نکاتی را پوشش داد که در پروژه‌های واقعی با آن مواجه هستیم.',
      likes: 6
    },
    {
      id: 'c2',
      name: 'سارا امینی',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      date: '۵ روز پیش',
      text: 'خیلی ممنون از تیم تک‌یاد. آیا دوره ویدیویی مرتبط با این سرفصل هم در سایت قرار می‌گیرد؟',
      likes: 3
    }
  ]);

  const { data: articleData, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => blogApi.getArticleBySlug(slug),
  });

  const { data: allArticlesData } = useQuery({
    queryKey: ['articles'],
    queryFn: () => blogApi.getArticles(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getCourses({ limit: 4 }),
  });

  const article = articleData?.data as any;
  const allArticles = (allArticlesData?.data as any[]) || [];
  const courses = (coursesData?.data as any)?.courses || (coursesData?.data as any) || [];

  // Reading progress and active heading scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
      }

      // Check headings
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveHeadingId(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Extract headings from article content or provide defaults
  useEffect(() => {
    if (!article?.content) return;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(article.content, 'text/html');
      const hTags = doc.querySelectorAll('h2, h3');
      const parsedHeadings: { id: string; text: string }[] = [];

      hTags.forEach((h, index) => {
        const text = h.textContent?.trim() || '';
        if (text) {
          const id = h.id || `heading-${index + 1}`;
          parsedHeadings.push({ id, text });
        }
      });

      if (parsedHeadings.length > 0) {
        setHeadings(parsedHeadings);
      } else {
        setHeadings([
          { id: 'intro', text: 'مقدمه و پیش‌زمینه' },
          { id: 'section-1', text: 'مفاهیم و اصول کلیدی' },
          { id: 'section-2', text: 'پیاده‌سازی گام‌به‌گام عملی' },
          { id: 'conclusion', text: 'نتیجه‌گیری و جمع‌بندی' },
        ]);
      }
    } catch {
      setHeadings([
        { id: 'intro', text: 'مقدمه و پیش‌زمینه' },
        { id: 'section-1', text: 'مفاهیم و اصول کلیدی' },
        { id: 'section-2', text: 'پیاده‌سازی گام‌به‌گام عملی' },
        { id: 'conclusion', text: 'نتیجه‌گیری و جمع‌بندی' },
      ]);
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="bg-[var(--neo-bg)] min-h-screen py-8 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <main className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 sm:p-10 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-4/5"></div>
                <div className="flex items-center gap-4 py-4 border-y border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="aspect-[16/9] bg-gray-200 rounded-2xl w-full"></div>
                <div className="space-y-4 pt-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3 my-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </main>

            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 shadow-sm space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    const isUnpublished = (error as any)?.response?.data?.error?.code === 'FORBIDDEN_UNPUBLISHED' || 
                          (error as any)?.response?.status === 403;

    return (
      <div className="bg-[var(--neo-bg)] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[var(--neo-border)] p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            {isUnpublished ? '🔒' : '!'}
          </div>
          <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">
            {isUnpublished ? 'این مقاله در دسترس نیست' : 'مقاله یافت نشد'}
          </h2>
          <p className="text-sm text-[var(--neo-text-muted)] mb-6 leading-relaxed">
            {isUnpublished 
              ? 'این مقاله هنوز توسط نویسنده یا مدیران منتشر نشده است یا در وضعیت پیش‌نویس قرار دارد.'
              : 'ممکن است آدرس مقاله تغییر کرده باشد یا حذف شده باشد.'}
          </p>
          <Link href="/blog" className="inline-flex items-center justify-center gap-2 bg-[var(--neo-primary)] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
            بازگشت به مقالات وبلاگ
          </Link>
        </div>
      </div>
    );
  }

  const relatedArticles = allArticles.filter(a => a.slug !== slug).slice(0, 4);
  const relatedCourse = courses.length > 0 ? courses[Math.floor(Math.random() * courses.length)] : null;
  const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 850;
  const readingTime = Math.max(3, Math.ceil(wordCount / 220));

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک مقاله در کلیپ‌بورد کپی شد!');
    }
  };

  const handleShareTelegram = () => {
    if (typeof window !== 'undefined') {
      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`;
      window.open(url, '_blank');
    }
  };

  const handleShareWhatsapp = () => {
    if (typeof window !== 'undefined') {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`;
      window.open(url, '_blank');
    }
  };

  const handleShareTwitter = () => {
    if (typeof window !== 'undefined') {
      const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`;
      window.open(url, '_blank');
    }
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      toast.success('ممنون از پسند شما!');
    }
  };

  const handleToggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    toast.success(!isBookmarked ? 'مقاله در نشان‌شده‌ها ذخیره شد' : 'مقاله از نشان‌شده‌ها حذف شد');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error('لطفاً دیدگاه خود را بنویسید');
      return;
    }
    const newComment: CommentItem = {
      id: Date.now().toString(),
      name: 'کاربر تک‌یاد',
      avatar: 'https://ui-avatars.com/api/?name=User&background=0284c7&color=fff',
      date: 'هم‌اکنون',
      text: commentText.trim(),
      likes: 0
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success('دیدگاه شما با موفقیت ثبت شد!');
  };

  const handleCommentLike = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  // Font size class mapper
  const fontSizeClass = fontSize === 'large' ? 'text-xl leading-loose' : fontSize === 'xlarge' ? 'text-2xl leading-loose' : 'text-lg leading-relaxed';

  return (
    <main className="flex-1 bg-[var(--neo-bg)] pb-20 w-full relative">
      
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-200">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Article Header (Hero) */}
      <div className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="px-4 py-1.5 bg-blue-600/90 text-white rounded-full text-xs font-bold shadow-md backdrop-blur-xs">
              {(article.categoryId || article.category)?.name || 'مقاله تخصصی'}
            </span>
            <span className="text-xs text-slate-400 bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              شنیداری ({readingTime} دقیقه)
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight text-balance">
            {article.title}
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {article.excerpt || 'در این مقاله به بررسی جامع و کامل این مبحث آموزشی می‌پردازیم و نکات کاربردی را با هم مرور خواهیم کرد.'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2.5">
              <img 
                src={(article.authorId || article.author)?.personnelPhoto || (article.authorId || article.author)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((article.authorId || article.author)?.firstName || 'تک')}+${encodeURIComponent((article.authorId || article.author)?.lastName || 'یاد')}&background=0284c7&color=fff`} 
                alt="Author" 
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" 
              />
              <div className="text-right">
                <div className="text-white font-bold text-sm">{(article.authorId || article.author)?.firstName || 'تیم'} {(article.authorId || article.author)?.lastName || 'تک‌یاد'}</div>
                <div className="text-[11px] text-slate-400">نویسنده و مدرس</div>
              </div>
            </div>
            
            <div className="w-px h-6 bg-white/20 hidden sm:block"></div>
            
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
            </div>
            
            <div className="w-px h-6 bg-white/20 hidden sm:block"></div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{readingTime} دقیقه مطالعه ({wordCount.toLocaleString('fa-IR')} کلمه)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content Article */}
        <article className="flex-1 w-full max-w-4xl bg-white rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-xl mb-12">
          
          {/* Article Cover Image */}
          {article.thumbnail && (
            <div className="w-full aspect-video bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
              <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Article Tools Bar: Font Size, Likes, Bookmark, Share */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 sm:px-12 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Type className="w-4 h-4" /> اندازه قلم:
              </span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                <button 
                  onClick={() => setFontSize('normal')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  معمولی
                </button>
                <button 
                  onClick={() => setFontSize('large')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  بزرگ
                </button>
                <button 
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${fontSize === 'xlarge' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  خیلی بزرگ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  isLiked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="پسندیدن مقاله"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{likesCount.toLocaleString('fa-IR')}</span>
              </button>

              <button 
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl border transition ${
                  isBookmarked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="نشان کردن برای مطالعه بعدی"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>

              <button 
                onClick={copyLink}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                title="کپی لینک مقاله"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-10 md:p-12 lg:p-14">
            
            {/* Inline Table of Contents for Mobile */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-10 bg-blue-50/60 rounded-2xl p-5 border border-blue-100">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  فهرست عناوین مقاله
                </h3>
                <ul className="space-y-2">
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a 
                        href={`#${h.id}`} 
                        className="text-xs font-medium text-slate-700 hover:text-blue-600 transition flex items-center gap-2 py-0.5"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                        <span>{h.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Content with Dynamic Font Size */}
            <div className={`text-[var(--neo-text-secondary)] ${fontSizeClass} [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:text-[var(--neo-text-main)] [&>h2]:mt-10 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:text-[var(--neo-text-main)] [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>li]:mb-2 [&>a]:text-[var(--neo-primary)] [&>a]:underline prose prose-slate max-w-none`}>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
            
            {/* Social Share & Tags Bar */}
            <div className="mt-12 pt-8 border-t border-[var(--neo-border)] space-y-6">
              {article.tags && article.tags.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-2">برچسب‌های موضوعی:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {article.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>این مقاله را برای دوستانتان بفرستید:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleShareTelegram}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1.5"
                  >
                    تلگرام
                  </button>
                  <button 
                    onClick={handleShareWhatsapp}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
                  >
                    واتساپ
                  </button>
                  <button 
                    onClick={handleShareTwitter}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
                  >
                    توییتر / X
                  </button>
                  <button 
                    onClick={copyLink}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    کپی لینک
                  </button>
                </div>
              </div>
            </div>

            {/* Author Bio Box */}
            <div className="mt-10 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-right">
              <img 
                src={(article.authorId || article.author)?.personnelPhoto || (article.authorId || article.author)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((article.authorId || article.author)?.firstName || 'تک')}+${encodeURIComponent((article.authorId || article.author)?.lastName || 'یاد')}&background=0284c7&color=fff`} 
                alt="Author" 
                className="w-20 h-20 rounded-2xl shadow-sm object-cover border border-slate-200"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-bold text-lg text-slate-900">
                    {(article.authorId || article.author)?.firstName || 'تیم آموزش'} {(article.authorId || article.author)?.lastName || 'تک‌یاد'}
                  </h3>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    مدرس و نویسنده
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {(article.authorId || article.author)?.bio || 'مدرس و پژوهشگر تخصصی آکادمی تک‌یاد با تمرکز بر آموزش‌های کاربردی، استاندارد و حل مسائل دنیای واقعی.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Link 
                    href="/courses" 
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    مشاهده دوره‌های مرتبط
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </article>

        {/* Sidebar Sticky for Desktop */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-24 space-y-6">
          
          {/* Table of Contents Sticky Widget */}
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 shadow-sm">
            <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              سرفصل‌های این مقاله
            </h3>
            <ul className="space-y-2.5">
              {headings.map((h, i) => {
                const isActive = activeHeadingId === h.id;
                return (
                  <li key={i}>
                    <a 
                      href={`#${h.id}`} 
                      className={`text-xs transition-all flex items-start gap-2.5 p-2 rounded-xl ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 font-bold border-r-2 border-blue-600' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span className="leading-snug">{h.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400">اطلاعات خواندن</h4>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-500">زمان تخمینی مطالعه:</span>
              <span className="font-bold text-slate-900">{readingTime} دقیقه</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 text-xs">
              <span className="text-slate-500">تعداد کلمات:</span>
              <span className="font-bold text-slate-900">{wordCount.toLocaleString('fa-IR')} کلمه</span>
            </div>
            <div className="flex justify-between items-center py-1.5 text-xs">
              <span className="text-slate-500">سطح مبحث:</span>
              <span className="font-bold text-emerald-600">کاربردی و عمومی</span>
            </div>
          </div>

          {/* Related Articles in Sidebar */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                مقالات پیشنهادی
              </h3>
              <div className="space-y-4">
                {relatedArticles.slice(0, 3).map(rel => (
                  <Link key={rel._id} href={`/blog/${rel.slug}`} className="flex gap-3 group items-center">
                    <img src={rel.thumbnail || `https://picsum.photos/seed/${rel._id}/100/100`} alt={rel.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(rel.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Conversion Banner: Related Course & Comments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-12">
          
          {/* Related Course Banner */}
          {relatedCourse && (
            <div className="bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden border border-white/10">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-right space-y-3">
                  <div className="text-amber-400 text-xs font-bold flex items-center justify-center md:justify-start gap-1.5">
                    <BookOpen className="w-4 h-4" /> پیشنهاد یادگیری پیشرفته
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    دوره آموزشی مرتبط: {relatedCourse.title}
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                    برای تسلط عمیق بر مباحث عملی این حوزه، دوره ویدئویی جامع آکادمی را با پشتیبانی استاد تجربه کنید.
                  </p>
                  <div className="pt-2">
                    <Link 
                      href={`/courses/${relatedCourse.slug || relatedCourse._id}`} 
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30"
                    >
                      مشاهده سرفصل‌ها و ثبت‌نام دوره
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                {relatedCourse.thumbnail && (
                  <img src={relatedCourse.thumbnail} alt={relatedCourse.title} className="w-full md:w-56 aspect-video object-cover rounded-2xl shadow-lg border-2 border-white/10" />
                )}
              </div>
            </div>
          )}

          {/* Interactive Comments Section */}
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                دیدگاه‌های خوانندگان ({comments.length.toLocaleString('fa-IR')})
              </h3>
              <span className="text-xs text-slate-400 font-medium">نظرات پس از ثبت به اشتراک گذاشته می‌شوند</span>
            </div>
            
            {/* Comment Form */}
            <div className="space-y-3">
              <textarea 
                rows={3}
                placeholder="نظر یا پرسش خود را درباره این مقاله بنویسید..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
              <div className="flex justify-end">
                <button 
                  onClick={handleAddComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" /> 
                  ارسال دیدگاه
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {comments.map(c => (
                <div key={c.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=0284c7&color=fff`} 
                        alt={c.name} 
                        className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.date}</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCommentLike(c.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition px-2 py-1 rounded-lg hover:bg-rose-50"
                      title="مفید بود"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{c.likes}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pr-12">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

    </main>
  );
}
