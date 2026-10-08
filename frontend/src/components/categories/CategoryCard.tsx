'use client';

import Link from 'next/link';
import { FolderTree, ChevronLeft, BookOpen, GraduationCap } from 'lucide-react';

interface CategoryCardProps {
  category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    courseCount?: number;
    classCount?: number;
    icon?: string;
  };
  variant?: 'pill' | 'card';
}

export function CategoryCard({ category, variant = 'card' }: CategoryCardProps) {
  const totalCount = (category.courseCount || 0) + (category.classCount || 0);

  if (variant === 'pill') {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-[var(--neo-border)] hover:border-[var(--neo-primary)] text-[var(--neo-text-main)] hover:text-[var(--neo-primary)] hover:shadow-sm transition-all duration-200 text-xs sm:text-sm font-medium group"
      >
        <span className="w-2 h-2 rounded-full bg-[var(--neo-primary)]/40 group-hover:bg-[var(--neo-primary)] transition-colors" />
        <span>{category.name}</span>
        {totalCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--neo-surface-2)] text-[var(--neo-text-muted)] group-hover:text-[var(--neo-primary)]">
            {totalCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/50 hover:shadow-lg hover:shadow-[var(--neo-primary)]/5 transition-all duration-300 flex flex-col justify-between text-right"
    >
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[var(--neo-surface-2)] text-[var(--neo-primary)] flex items-center justify-center border border-[var(--neo-border)] group-hover:bg-[var(--neo-primary)] group-hover:text-white transition-colors duration-300">
            <FolderTree className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-[var(--neo-text-muted)] bg-[var(--neo-surface-2)] px-2.5 py-1 rounded-full">
            {totalCount > 0 ? `${totalCount} عنوان` : 'محتوای آموزشی'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors mb-1.5">
          {category.name}
        </h3>

        {category.description && (
          <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] line-clamp-2 leading-relaxed mb-4">
            {category.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--neo-border)]/60 flex items-center justify-between text-xs text-[var(--neo-text-muted)] group-hover:text-[var(--neo-primary)] transition-colors">
        <div className="flex items-center gap-3">
          {category.courseCount !== undefined && category.courseCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[var(--neo-secondary)]" />
              <span>{category.courseCount} دوره</span>
            </span>
          )}
          {category.classCount !== undefined && category.classCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[var(--neo-primary)]" />
              <span>{category.classCount} کلاس</span>
            </span>
          )}
        </div>
        <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
