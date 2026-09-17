import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

export function LatestArticles({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">دانشنامه</span>
            </div>
            <h2 className="text-3xl font-black text-[var(--neo-text-main)]">آخرین مقالات آموزشی</h2>
          </div>
          <Link href="/blog" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه مقالات
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.slice(0, 3).map((article: any) => (
            <Link key={article._id} href={`/blog/${article.slug}`} className="group flex flex-col bg-white rounded-[20px] border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/50 transition duration-300 neo-card">
              <div className="aspect-video relative overflow-hidden bg-[var(--neo-surface-2)]">
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--neo-text-muted)]">
                    <FileText className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[var(--neo-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {article.category?.name || 'آموزشی'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-[var(--neo-text-muted)] mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(article.createdAt || Date.now()).toLocaleDateString('fa-IR')}
                </div>
                
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-lg line-clamp-2 group-hover:text-[var(--neo-primary)] transition-colors">{article.title}</h3>
                <p className="text-sm text-[var(--neo-text-secondary)] line-clamp-2 mb-6 leading-relaxed">{article.excerpt || "در این مقاله به بررسی این موضوع جذاب می‌پردازیم..."}</p>
                
                <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-[var(--neo-primary)] text-sm font-bold">
                  <span>مطالعه مقاله</span>
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
