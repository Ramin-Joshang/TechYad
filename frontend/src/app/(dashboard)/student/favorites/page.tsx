'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '@/features/community/api/community.api';
import { Heart, Loader2, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: favoritesData, isLoading } = useQuery({
    queryKey: ['myFavorites'],
    queryFn: () => communityApi.getMyFavorites().then(res => res.data)
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (courseId: string) => communityApi.toggleFavorite(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFavorites'] });
    }
  });

  const favorites = favoritesData || [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--neo-text-main)] mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-600" />
            علاقه‌مندی‌ها
          </h1>
          <p className="text-[var(--neo-text-secondary)]">دوره‌هایی که دوست دارید بعداً یاد بگیرید.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
          <p className="text-[var(--neo-text-secondary)]">در حال بارگذاری علاقه‌مندی‌ها...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-[var(--neo-surface)] rounded-3xl p-16 text-center border border-[var(--neo-border)] shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">علاقه‌مندی خالی است</h3>
          <p className="text-[var(--neo-text-secondary)] mb-8 max-w-sm mx-auto">دوره‌هایی که می‌خواهید بعداً مشاهده کنید را به علاقه‌مندی‌های خود اضافه کنید.</p>
          <Link href="/courses" className="bg-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-600/20">
            مشاهده دوره‌های آموزشی
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {favorites.map((favorite: any) => {
            const course = favorite.courseId;
            if (!course) return null;
            
            return (
              <div key={favorite._id} className="bg-[var(--neo-surface)] rounded-3xl overflow-hidden border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="relative aspect-[4/3] bg-[var(--neo-surface-2)]">
                  <img src={course.thumbnail || `https://picsum.photos/seed/${course._id}/400/300`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => toggleFavoriteMutation.mutate(course._id)}
                    className="absolute top-4 left-4 w-10 h-10 bg-[var(--neo-surface)]/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-[var(--neo-surface)] shadow-sm transition"
                    title="حذف از علاقه‌مندی‌ها"
                  >
                    {toggleFavoriteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                  {course.price === 0 && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      رایگان
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-[var(--neo-text-main)] mb-2 line-clamp-2 min-h-[3.5rem]" title={course.title}>
                    <Link href={`/courses/${course.slug}`} className="hover:text-[var(--neo-primary)] transition">
                      {course.title}
                    </Link>
                  </h3>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--neo-text-secondary)] line-clamp-1">{course.instructorId?.firstName} {course.instructorId?.lastName}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{course.averageRating ? course.averageRating.toFixed(1) : 'جدید'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--neo-border)]">
                    <div className="font-bold text-[var(--neo-text-main)]">
                      {course.price > 0 ? `${course.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
