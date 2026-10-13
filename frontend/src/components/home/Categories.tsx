'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, Cpu, GraduationCap, Binary, Zap, Atom, BookOpen, 
  Calculator, ArrowLeft, ChevronDown, ChevronUp, Layers
} from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coursesCount?: number;
  sortOrder?: number;
}

const CATEGORY_META: Record<string, {
  icon: any;
  bgLight: string;
  borderColor: string;
  textColor: string;
  tags: string[];
  priority: number;
}> = {
  'programming': {
    icon: Code2,
    bgLight: 'bg-violet-50 text-violet-600',
    borderColor: 'hover:border-violet-400',
    textColor: 'text-violet-600',
    tags: ['پایتون', 'جاوااسکریپت', 'ری‌اکت'],
    priority: 1,
  },
  'computer-engineering': {
    icon: Cpu,
    bgLight: 'bg-sky-50 text-sky-600',
    borderColor: 'hover:border-sky-400',
    textColor: 'text-sky-600',
    tags: ['ساختمان داده', 'الگوریتم', 'شبکه'],
    priority: 2,
  },
  'university-courses': {
    icon: GraduationCap,
    bgLight: 'bg-emerald-50 text-emerald-600',
    borderColor: 'hover:border-emerald-400',
    textColor: 'text-emerald-600',
    tags: ['ریاضی عمومی', 'فیزیک دانشگاهی'],
    priority: 3,
  },
  'mathematics-statistics': {
    icon: Binary,
    bgLight: 'bg-amber-50 text-amber-600',
    borderColor: 'hover:border-amber-400',
    textColor: 'text-amber-600',
    tags: ['آمار و احتمال', 'جبر خطی'],
    priority: 4,
  },
  'electrical-engineering': {
    icon: Zap,
    bgLight: 'bg-yellow-50 text-amber-600',
    borderColor: 'hover:border-yellow-400',
    textColor: 'text-amber-600',
    tags: ['مدار الکتریکی', 'سیگنال و سیستم'],
    priority: 5,
  },
  'basic-sciences': {
    icon: Atom,
    bgLight: 'bg-teal-50 text-teal-600',
    borderColor: 'hover:border-teal-400',
    textColor: 'text-teal-600',
    tags: ['فیزیک پایه', 'شیمی عمومی'],
    priority: 6,
  },
  'school-subjects': {
    icon: BookOpen,
    bgLight: 'bg-rose-50 text-rose-600',
    borderColor: 'hover:border-rose-400',
    textColor: 'text-rose-600',
    tags: ['حسابان', 'هندسه', 'شیمی کنکور'],
    priority: 7,
  },
  'pre-university-math': {
    icon: Calculator,
    bgLight: 'bg-cyan-50 text-cyan-600',
    borderColor: 'hover:border-cyan-400',
    textColor: 'text-cyan-600',
    tags: ['توابع و نمودار', 'مثلثات'],
    priority: 8,
  },
};

const DEFAULT_META = {
  icon: Layers,
  bgLight: 'bg-indigo-50 text-indigo-600',
  borderColor: 'hover:border-indigo-400',
  textColor: 'text-indigo-600',
  tags: ['دوره‌های تخصصی'],
  priority: 99,
};

export function Categories({ data = [], isLoading = false }: { data?: CategoryItem[], isLoading?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isLoading && !data?.length) return null;

  // Standard sorting
  const sortedCategories = [...data].sort((a, b) => {
    const pA = CATEGORY_META[a.slug]?.priority ?? (a.sortOrder || 50);
    const pB = CATEGORY_META[b.slug]?.priority ?? (b.sortOrder || 50);
    return pA - pB;
  });

  // Only show top 4 by default (compact mode requested by user)
  const displayedCategories = isExpanded ? sortedCategories : sortedCategories.slice(0, 4);
  const remainingCount = Math.max(0, sortedCategories.length - 4);

  return (
    <section className="py-12 sm:py-16 bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 text-right w-full">
          <div>
            <div className="flex items-center gap-2 mb-2 justify-start">
              <span className="w-6 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase">
                مسیرهای یادگیری
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)]">
              گسترش مرزهای دانش
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--neo-border)] hover:border-[var(--neo-primary)] text-[var(--neo-text-main)] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{isExpanded ? 'نمایش کمتر' : `مشاهده ${remainingCount} دسته دیگر`}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            <Link
              href="/categories"
              className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] text-xs font-bold transition inline-flex items-center gap-1 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]"
            >
              <span>همه دسته‌ها</span>
              <span>←</span>
            </Link>
          </div>
        </div>

        {/* Categories Grid (Compact 4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            : displayedCategories.map((cat, idx) => {
                const meta = CATEGORY_META[cat.slug] || DEFAULT_META;
                const IconComponent = meta.icon;

                return (
                  <Link
                    key={cat._id}
                    href={`/categories/${cat.slug}`}
                    className={`group bg-white p-5 rounded-2xl border border-[var(--neo-border)] ${meta.borderColor} transition-all duration-300 flex flex-col hover:-translate-y-0.5 shadow-2xs hover:shadow-md text-right`}
                  >
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`w-11 h-11 rounded-xl ${meta.bgLight} flex items-center justify-center transition group-hover:scale-105`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <span className="text-[11px] font-bold text-gray-400 group-hover:text-[var(--neo-primary)] font-mono">
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="font-bold text-[var(--neo-text-main)] mb-1.5 text-base group-hover:text-[var(--neo-primary)] transition-colors">
                      {cat.name}
                    </h3>

                    <p className="text-[11px] text-[var(--neo-text-secondary)] line-clamp-2 leading-relaxed mb-3">
                      {cat.description || 'آموزش‌های تخصصی، مباحث پایه تا پیشرفته و پروژه‌محور.'}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4 mt-auto">
                      {meta.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-[var(--neo-surface-2)] text-[10px] text-[var(--neo-text-secondary)] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-[var(--neo-border)] flex items-center justify-between text-xs font-bold text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-primary)]">
                      <span>مشاهده دوره‌ها</span>
                      <span>←</span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
