import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCategories } from '@/lib/server-api';
import { FolderTree, Sparkles, BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'دسته‌بندی جامع دوره‌ها و کلاس‌های آموزشی | تک‌یاد',
  description: 'مسیرهای یادگیری تخصصی برنامه‌نویسی، طراحی وب، هوش مصنوعی، علوم داده، شبکه و امنیت در تک‌یاد. انتخاب دسته‌بندی و شروع یادگیری مهارت‌های بازار کار.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://tecyad.ir/categories',
    siteName: 'تک‌یاد | Tecyad',
    title: 'دسته‌بندی دوره‌ها و کلاس‌های آموزشی | تک‌یاد (Tecyad)',
    description: 'مسیرهای یادگیری تخصصی برنامه‌نویسی، طراحی وب و هوش مصنوعی.',
  },
};

export default async function CategoriesIndexPage() {
  const treeCategories = await fetchCategories({ tree: true }) || [];

  return (
    <div dir="rtl" className="min-h-screen bg-[var(--neo-bg)] text-right pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-white to-[var(--neo-surface-2)]/40 border-b border-[var(--neo-border)] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 text-center sm:text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] text-xs font-bold mx-auto sm:mx-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مسیرهای تخصصی یادگیری</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--neo-text-main)] tracking-tight">
            دسته‌بندی دوره‌ها و کلاس‌های آموزشی
          </h1>
          <p className="text-sm sm:text-base text-[var(--neo-text-secondary)] max-w-3xl leading-relaxed">
            شاخه مورد علاقه خود را انتخاب کنید و به جدیدترین دوره‌های ویدیویی و کلاس‌های آنلاین و حضوری دسترسی پیدا کنید.
          </p>
        </div>
      </section>

      {/* Categories Tree Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {treeCategories.map((rootCat: any) => {
          const totalContent = (rootCat.courseCount || 0) + (rootCat.classCount || 0);
          return (
            <div
              key={rootCat._id}
              className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Root Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--neo-border)]/80">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center shrink-0 border border-[var(--neo-primary)]/20">
                    <FolderTree className="w-6 h-6" />
                  </div>
                  <div>
                    <Link
                      href={`/categories/${rootCat.slug}`}
                      className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)] hover:text-[var(--neo-primary)] transition-colors"
                    >
                      {rootCat.name}
                    </Link>
                    {rootCat.description && (
                      <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1 line-clamp-2 max-w-3xl">
                        {rootCat.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--neo-text-muted)] bg-[var(--neo-surface-2)] px-3 py-1.5 rounded-xl">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--neo-secondary)]" />
                    <span>{rootCat.courseCount || 0} دوره</span>
                    <span className="text-[var(--neo-border)]">•</span>
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--neo-primary)]" />
                    <span>{rootCat.classCount || 0} کلاس</span>
                  </div>

                  <Link
                    href={`/categories/${rootCat.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--neo-primary)] text-white text-xs font-bold hover:opacity-95 transition"
                  >
                    <span>مشاهده شاخه</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Subcategories (Level 1) */}
              {rootCat.children && rootCat.children.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rootCat.children.map((subCat: any) => (
                    <div
                      key={subCat._id}
                      className="p-5 rounded-2xl bg-[var(--neo-surface-2)]/50 border border-[var(--neo-border)]/70 hover:border-[var(--neo-primary)]/40 hover:bg-white hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={`/categories/${subCat.slug}`}
                            className="font-bold text-base text-[var(--neo-text-main)] hover:text-[var(--neo-primary)] transition-colors"
                          >
                            {subCat.name}
                          </Link>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[var(--neo-text-muted)] border border-[var(--neo-border)]">
                            {(subCat.courseCount || 0) + (subCat.classCount || 0)} عنوان
                          </span>
                        </div>

                        {subCat.description && (
                          <p className="text-xs text-[var(--neo-text-secondary)] line-clamp-2 leading-relaxed mb-3">
                            {subCat.description}
                          </p>
                        )}

                        {/* Sub-subcategories pills (Level 2) */}
                        {subCat.children && subCat.children.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {subCat.children.map((subSubCat: any) => (
                              <Link
                                key={subSubCat._id}
                                href={`/categories/${subSubCat.slug}`}
                                className="text-[11px] px-2 py-0.5 rounded-lg bg-white hover:bg-[var(--neo-primary)] hover:text-white text-[var(--neo-text-secondary)] border border-[var(--neo-border)] transition-colors"
                              >
                                {subSubCat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--neo-border)]/50 flex justify-end">
                        <Link
                          href={`/categories/${subCat.slug}`}
                          className="text-xs font-bold text-[var(--neo-primary)] inline-flex items-center gap-1 hover:underline"
                        >
                          <span>مشاهده همه</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--neo-text-muted)]">
                  زیردسته‌ای برای این شاخه ثبت نشده است.
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
