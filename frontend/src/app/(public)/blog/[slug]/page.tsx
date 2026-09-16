'use client';

import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/features/blog/api/blog.api';
import { coursesApi } from '@/features/courses/api/courses.api';
import { useParams } from 'next/navigation';
import { Calendar, User, Tag, BookOpen, ArrowLeft, MessageSquare, ThumbsUp, Send, Share2, Link as LinkIcon, Clock, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [headings, setHeadings] = useState<{id: string, text: string}[]>([]);

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

  useEffect(() => {
    // Generate mock table of contents if not actually present in HTML, 
    // or we can just render a static block if we don't parse HTML.
    // For now we'll do a static mock TOC to match the requested design pattern.
    setHeadings([
      { id: 'intro', text: 'مقدمه' },
      { id: 'section-1', text: 'مفاهیم پایه' },
      { id: 'section-2', text: 'پیاده‌سازی عملی' },
      { id: 'conclusion', text: 'نتیجه‌گیری' },
    ]);
  }, [article]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center p-20"><div className="animate-pulse text-xl text-gray-500">در حال بارگذاری مقاله...</div></div>;
  }

  if (error || !article) {
    return <div className="flex-1 flex items-center justify-center p-20"><div className="text-xl text-red-500">مقاله یافت نشد یا خطایی رخ داده است.</div></div>;
  }

  const relatedArticles = allArticles.filter(a => a.slug !== slug).slice(0, 4);
  const relatedCourse = courses.length > 0 ? courses[Math.floor(Math.random() * courses.length)] : null;
  const readingTime = Math.max(3, Math.ceil(article.content.length / 1000));

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک کپی شد!');
    }
  };

  return (
    <main className="flex-1 bg-gray-50 pb-20 w-full">
      {/* Article Header (Hero) */}
      <div className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/1920/1080')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-6 inline-flex">
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md">
              {(article as any).category?.name || 'آموزشی'}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            {article.excerpt || 'در این مقاله به بررسی جامع و کامل این موضوع می‌پردازیم و تمام نکات کاربردی را با هم مرور خواهیم کرد.'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-2">
              <img 
                src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.firstName || 'A'}+${article.author?.lastName || 'U'}`} 
                alt="Author" 
                className="w-10 h-10 rounded-full border-2 border-white/20" 
              />
              <div className="text-right">
                <div className="text-white font-bold text-base">{article.author?.firstName || 'تیم'} {article.author?.lastName || 'تک‌یاد'}</div>
                <div className="text-xs">نویسنده</div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              {new Date(article.createdAt).toLocaleDateString('fa-IR')}
            </div>
            <div className="w-px h-8 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              {readingTime} دقیقه مطالعه
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content */}
        <article className="flex-1 w-full max-w-4xl bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl mb-12">
          {article.thumbnail && (
            <div className="w-full aspect-video bg-gray-100 relative border-b border-gray-100">
              <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-8 md:p-12 lg:p-16">
            
            {/* Table of Contents for Desktop (inline) or small screens */}
            <div className="lg:hidden mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">فهرست مطالب</h3>
              <ul className="space-y-3">
                {headings.map((h, i) => (
                  <li key={i}>
                    <a href={`#${h.id}`} className="text-blue-600 hover:text-blue-800 transition flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-gray-700 leading-relaxed text-lg [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:text-gray-900 [&>h2]:mt-10 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:text-gray-900 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>li]:mb-2 [&>a]:text-blue-600 [&>a]:underline">
              {/* Mock content injection to include headings if none exist */}
              <h2 id="intro">مقدمه</h2>
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
              <h2 id="section-1">مفاهیم پایه</h2>
              <p>در این بخش به بررسی مفاهیم پایه می‌پردازیم...</p>
              <h2 id="section-2">پیاده‌سازی عملی</h2>
              <p>حالا نوبت به دست به کد شدن و پیاده‌سازی عملی می‌رسد...</p>
              <h2 id="conclusion">نتیجه‌گیری</h2>
              <p>در نهایت متوجه شدیم که...</p>
            </div>
            
            {/* Share & Tags */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-400 mr-2" />
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium border border-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 ml-2">اشتراک‌گذاری:</span>
                <button className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:scale-110 transition shadow-md" title="تلگرام">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.1-.65.01-.18.27-.36.78-.55 3.05-1.33 5.09-2.21 6.12-2.64 2.91-1.22 3.51-1.43 3.91-1.44.09 0 .28.02.38.1.09.07.12.18.1.33z"/></svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition shadow-md" title="واتس‌اپ">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/></svg>
                </button>
                <button onClick={copyLink} className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:scale-110 transition shadow-md" title="کپی لینک">
                  <LinkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
              <img 
                src={article.author?.avatar || `https://ui-avatars.com/api/?name=${article.author?.firstName || 'A'}+${article.author?.lastName || 'U'}&size=100&background=random`} 
                alt={article.author?.firstName} 
                className="w-24 h-24 rounded-full shadow-lg border-4 border-white"
              />
              <div className="text-center sm:text-right flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-1">{article.author?.firstName || 'تیم'} {article.author?.lastName || 'تک‌یاد'}</h3>
                <p className="text-sm font-bold text-blue-600 mb-4">مدرس و نویسنده ارشد</p>
                <p className="text-gray-600 leading-relaxed">
                  علاقه‌مند به تکنولوژی و آموزش مفاهیم پیچیده به ساده‌ترین شکل ممکن. تلاش می‌کنم در مقالاتم تجربیات چندین ساله خودم را با شما به اشتراک بگذارم و مسیر یادگیری را برای شما هموارتر کنم.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar for Desktop */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-24">
          
          {/* Table of Contents */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              فهرست مطالب
            </h3>
            <ul className="space-y-4">
              {headings.map((h, i) => (
                <li key={i}>
                  <a href={`#${h.id}`} className="text-gray-600 hover:text-blue-600 transition flex items-start gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-600 mt-2 shrink-0 transition-colors"></div>
                    <span className="leading-tight">{h.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Articles in Sidebar */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                مقالات مرتبط
              </h3>
              <div className="space-y-6">
                {relatedArticles.slice(0,3).map(rel => (
                  <Link key={rel._id} href={`/blog/${rel.slug}`} className="flex gap-4 group">
                    <img src={rel.thumbnail || `https://picsum.photos/seed/${rel._id}/100/100`} alt={rel.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug mb-1">{rel.title}</h4>
                      <div className="text-xs text-gray-400">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Conversion Banner: Related Course */}
          {relatedCourse && (
            <div className="mb-16 bg-gradient-to-l from-blue-900 to-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/1000/300')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-right">
                  <div className="text-amber-400 text-sm font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                    <BookOpen className="w-4 h-4" /> این مقاله را خواندی؟
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">دوره مرتبط:<br/>{relatedCourse.title}</h3>
                  <p className="text-blue-100 text-sm mb-8 max-w-xl leading-relaxed">
                    برای یادگیری عمیق‌تر و تسلط کامل روی این مبحث، پیشنهاد می‌کنیم در دوره تخصصی مرتبط با این مقاله شرکت کنید و سطح مهارت‌های خود را ارتقا دهید.
                  </p>
                  <Link href={`/courses/${relatedCourse.slug}`} className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">
                    مشاهده و ثبت‌نام دوره <ChevronLeft className="w-5 h-5" />
                  </Link>
                </div>
                {relatedCourse.thumbnail && (
                  <img src={relatedCourse.thumbnail} alt={relatedCourse.title} className="w-full md:w-72 aspect-square object-cover rounded-2xl shadow-xl border-4 border-white/10" />
                )}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-blue-600" />
              دیدگاه‌ها (۳)
            </h3>
            
            {/* Comment Form */}
            <div className="flex gap-4 md:gap-6 mb-12">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-bold text-lg shadow-inner">
                شما
              </div>
              <div className="flex-1 relative">
                <textarea 
                  rows={4}
                  placeholder="دیدگاه خود را درباره این مقاله بنویسید..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-inner"
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2">
                    <Send className="w-4 h-4 rotate-180" /> ثبت دیدگاه
                  </button>
                </div>
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-8">
              {[
                { name: 'محمد امین', date: 'دو روز پیش', text: 'مقاله بسیار جامع و کاملی بود. ممنون از توضیحات روان و مثال‌های کاربردی که آوردید.', likes: 12 },
                { name: 'سارا رضایی', date: 'یک هفته پیش', text: 'بخش مربوط به پیاده‌سازی عملی خیلی به من کمک کرد. بی‌صبرانه منتظر مقالات بعدی شما هستم.', likes: 5 },
                { name: 'علی کریمی', date: 'دو هفته پیش', text: 'عالی بود. فقط کاش به ابزارهای جایگزین هم اشاره می‌کردید.', likes: 2 }
              ].map((comment, idx) => (
                <div key={idx} className="flex gap-4 md:gap-6 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-gray-500 font-bold text-xl border border-gray-200">
                    {comment.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold text-gray-900 text-lg">{comment.name}</span>
                        <span className="text-sm text-gray-400 block sm:inline sm:mr-3 mt-1 sm:mt-0">{comment.date}</span>
                      </div>
                      <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
