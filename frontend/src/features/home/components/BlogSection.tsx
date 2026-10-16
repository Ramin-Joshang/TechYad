import { BlogPost } from '../api/home.api';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface Props {
  posts: BlogPost[];
}

export function BlogSection({ posts }: Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">جدیدترین مقالات وبلاگ</h2>
            <p className="text-gray-600">
              با مطالعه مقالات تخصصی، دانش خود را به‌روز نگه دارید.
            </p>
          </div>
          <Link 
            href="/blog"
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition"
          >
            مشاهده وبلاگ
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition group">
              <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
                <img 
                  src={getImageUrl(post.image, 'blog', post.title)} 
                  alt={post.title} 
                  className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => handleImageError(e, 'blog', post.title)}
                />
              </Link>
              
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{post.author}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
