"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Code2,
  Cpu,
  GraduationCap,
  Binary,
  Zap,
  Atom,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  Layers,
  FolderTree,
  ArrowLeft,
} from "lucide-react";

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | { _id: string; name?: string; slug?: string } | null;
  level?: number;
  description?: string;
  coursesCount?: number;
  classCount?: number;
  totalContent?: number;
  sortOrder?: number;
  children?: CategoryItem[];
}

const CATEGORY_META: Record<
  string,
  {
    icon: any;
    bgLight: string;
    borderColor: string;
    textColor: string;
  }
> = {
  programming: {
    icon: Code2,
    bgLight: "bg-violet-50 text-violet-600",
    borderColor: "hover:border-violet-400",
    textColor: "text-violet-600",
  },
  "computer-engineering": {
    icon: Cpu,
    bgLight: "bg-sky-50 text-sky-600",
    borderColor: "hover:border-sky-400",
    textColor: "text-sky-600",
  },
  "university-courses": {
    icon: GraduationCap,
    bgLight: "bg-emerald-50 text-emerald-600",
    borderColor: "hover:border-emerald-400",
    textColor: "text-emerald-600",
  },
  "mathematics-statistics": {
    icon: Binary,
    bgLight: "bg-amber-50 text-amber-600",
    borderColor: "hover:border-amber-400",
    textColor: "text-amber-600",
  },
  "electrical-engineering": {
    icon: Zap,
    bgLight: "bg-yellow-50 text-amber-600",
    borderColor: "hover:border-yellow-400",
    textColor: "text-amber-600",
  },
  "basic-sciences": {
    icon: Atom,
    bgLight: "bg-teal-50 text-teal-600",
    borderColor: "hover:border-teal-400",
    textColor: "text-teal-600",
  },
  "school-subjects": {
    icon: BookOpen,
    bgLight: "bg-rose-50 text-rose-600",
    borderColor: "hover:border-rose-400",
    textColor: "text-rose-600",
  },
  "pre-university-math": {
    icon: Calculator,
    bgLight: "bg-cyan-50 text-cyan-600",
    borderColor: "hover:border-cyan-400",
    textColor: "text-cyan-600",
  },
};

const DEFAULT_META = {
  icon: Layers,
  bgLight: "bg-blue-50 text-blue-600",
  borderColor: "hover:border-blue-400",
  textColor: "text-blue-600",
};

export function Categories({
  data = [],
  isLoading = false,
}: {
  data?: CategoryItem[];
  isLoading?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Build hierarchical roots and children
  const { rootCategories, totalCount } = useMemo(() => {
    if (!data || data.length === 0)
      return { rootCategories: [], totalCount: 0 };

    const idMap = new Map<
      string,
      CategoryItem & { subcategories: CategoryItem[] }
    >();
    const roots: (CategoryItem & { subcategories: CategoryItem[] })[] = [];

    // First pass: index all items
    data.forEach((item) => {
      idMap.set(String(item._id), {
        ...item,
        subcategories: Array.isArray(item.children) ? [...item.children] : [],
      });
    });

    // Second pass: group subcategories under roots
    data.forEach((item) => {
      const parentIdRaw = item.parentId;
      const parentIdStr = parentIdRaw
        ? typeof parentIdRaw === "object" && parentIdRaw !== null
          ? String(parentIdRaw._id)
          : String(parentIdRaw)
        : null;

      const current = idMap.get(String(item._id))!;

      if (parentIdStr && idMap.has(parentIdStr)) {
        // This is a child: append to its parent's subcategories if not already there
        const parent = idMap.get(parentIdStr)!;
        if (
          !parent.subcategories.some(
            (sub) => String(sub._id) === String(current._id),
          )
        ) {
          parent.subcategories.push(current);
        }
      } else if (!parentIdStr || item.level === 0) {
        // This is a root category
        if (!roots.some((r) => String(r._id) === String(current._id))) {
          roots.push(current);
        }
      }
    });

    // Sort roots by sortOrder ascending, fallback to createdAt or name
    roots.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Sort subcategories under each root by sortOrder
    roots.forEach((root) => {
      root.subcategories.sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
      );
    });

    // If no roots identified due to missing parent references, treat all level 0 as roots
    const finalRoots =
      roots.length > 0
        ? roots
        : data.map((item) => ({ ...item, subcategories: [] }));

    return { rootCategories: finalRoots, totalCount: finalRoots.length };
  }, [data]);

  if (!isLoading && rootCategories.length === 0) return null;

  const displayedRoots = isExpanded
    ? rootCategories
    : rootCategories.slice(0, 4);
  const remainingCount = Math.max(0, rootCategories.length - 4);

  return (
    <section className="py-12 sm:py-16 bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 text-right w-full">
          <div>
            <div className="flex items-center gap-2 mb-2 justify-start">
              <span className="w-6 h-1 bg-[var(--neo-primary)] rounded-full shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-wider text-xs uppercase">
                مسیرهای یادگیری و درخت دسته‌بندی‌ها
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--neo-text-main)]">
              گسترش مرزهای دانش در آکادمی تک یاد
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[var(--neo-border)] hover:border-[var(--neo-primary)] text-[var(--neo-text-main)] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>
                  {isExpanded
                    ? "نمایش کمتر"
                    : `مشاهده ${remainingCount} شاخه اصلی دیگر`}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <Link
              href="/categories"
              className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] text-xs font-bold transition inline-flex items-center gap-1 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]"
            >
              <span>مشاهده درخت کامل دسته‌ها</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hierarchical Categories Grid (4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] animate-pulse space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                    <div className="h-6 w-20 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))
            : displayedRoots.map((root, idx) => {
                const meta = CATEGORY_META[root.slug] || DEFAULT_META;
                const IconComponent = meta.icon;
                const totalContentCount =
                  (root.coursesCount || 0) + (root.classCount || 0);

                return (
                  <div
                    key={root._id}
                    className={`group bg-white p-6 rounded-3xl border border-[var(--neo-border)] ${meta.borderColor} transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-2xs hover:shadow-md text-right relative`}
                  >
                    {/* Top Row: Icon, Index & Direct Link */}
                    <div className="flex items-center justify-between mb-4">
                      <Link
                        href={`/categories/${root.slug}`}
                        className={`w-12 h-12 rounded-2xl ${meta.bgLight} flex items-center justify-center transition group-hover:scale-105 shrink-0`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </Link>

                      <div className="flex items-center gap-2">
                        {totalContentCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {totalContentCount} دوره/کلاس
                          </span>
                        )}
                        <span className="text-xs font-black text-gray-300 group-hover:text-[var(--neo-primary)] font-mono">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Root Category Name */}
                    <Link
                      href={`/categories/${root.slug}`}
                      className="block mb-2"
                    >
                      <h3 className="font-black text-[var(--neo-text-main)] text-lg group-hover:text-[var(--neo-primary)] transition-colors">
                        {root.name}
                      </h3>
                    </Link>

                    {/* Root Description */}
                    <p className="text-xs text-[var(--neo-text-secondary)] line-clamp-2 leading-relaxed mb-4">
                      {root.description ||
                        "آموزش‌های تخصصی، مباحث پایه تا پیشرفته و مهارت‌های بازار کار."}
                    </p>

                    {/* Subcategories: Hierarchical Children under Parent */}
                    <div className="mt-auto pt-3 border-t border-[var(--neo-border)]">
                      <div className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1">
                        <FolderTree className="w-3 h-3 text-[var(--neo-primary)]" />
                        <span>زیرشاخه‌ها:</span>
                      </div>

                      {root.subcategories && root.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {root.subcategories.slice(0, 4).map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/categories/${sub.slug}`}
                              className="inline-flex items-center text-[11px] px-2.5 py-1 rounded-lg bg-[var(--neo-surface-2)] hover:bg-[var(--neo-primary)] hover:text-white text-[var(--neo-text-secondary)] font-medium transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                          {root.subcategories.length > 4 && (
                            <Link
                              href={`/categories/${root.slug}`}
                              className="inline-flex items-center text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:text-[var(--neo-primary)] font-bold"
                            >
                              +{root.subcategories.length - 4} بیشتر
                            </Link>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 mb-3">
                          مشاهده دوره‌ها و کارگاه‌های این شاخه
                        </div>
                      )}

                      {/* Footer action link */}
                      <Link
                        href={`/categories/${root.slug}`}
                        className="flex items-center justify-between text-xs font-black text-[var(--neo-primary)] pt-2 border-t border-gray-50 hover:underline"
                      >
                        <span>ورود به شاخه {root.name}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
