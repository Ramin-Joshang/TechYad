'use client';

import Link from 'next/link';
import { ChevronLeft, Home, Layers } from 'lucide-react';

export interface BreadcrumbItem {
  _id?: string;
  name: string;
  slug: string;
  level?: number;
}

interface CategoryBreadcrumbProps {
  items: BreadcrumbItem[];
  currentTitle?: string;
}

export function CategoryBreadcrumb({ items, currentTitle }: CategoryBreadcrumbProps) {
  return (
    <nav aria-label="مسیر راهنما" className="flex items-center flex-wrap gap-1.5 text-xs text-[var(--neo-text-muted)] py-2 select-none">
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-[var(--neo-primary)] transition-colors p-1 rounded-md hover:bg-white/60"
        title="صفحه اصلی تک‌یاد"
      >
        <Home className="w-3.5 h-3.5" />
        <span>خانه</span>
      </Link>

      <ChevronLeft className="w-3.5 h-3.5 text-[var(--neo-border)] shrink-0" />

      <Link
        href="/categories"
        className="inline-flex items-center gap-1 hover:text-[var(--neo-primary)] transition-colors p-1 rounded-md hover:bg-white/60"
        title="همه دسته‌بندی‌ها"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>دسته‌بندی‌ها</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item._id || item.slug} className="flex items-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--neo-border)] shrink-0" />
            {isLast ? (
              <span className="font-bold text-[var(--neo-text-main)] px-1.5 py-0.5 rounded-md bg-[var(--neo-surface-2)]">
                {currentTitle || item.name}
              </span>
            ) : (
              <Link
                href={`/categories/${item.slug}`}
                className="hover:text-[var(--neo-primary)] transition-colors p-1 rounded-md hover:bg-white/60"
              >
                {item.name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
