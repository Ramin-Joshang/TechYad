import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCategoryBySlug, fetchCategoryContent } from '@/lib/server-api';
import { CategoryPageClient } from '@/components/categories/CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await fetchCategoryBySlug(decodedSlug);

  if (!data) {
    return {
      title: 'دسته‌بندی یافت نشد | تک‌یاد',
    };
  }

  const title = data.seoTitle || `دوره‌ها و کلاس‌های ${data.name} | تک‌یاد`;
  const description = data.seoDescription || data.description || `مجموعه جامع دوره‌های ویدیویی و کلاس‌های آنلاین و حضوری ${data.name} با اساتید برتر در آکادمی آموزشی تک‌یاد`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${decodedSlug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: `https://tecyad.ir/categories/${decodedSlug}`,
      siteName: 'تک‌یاد | Tecyad',
      title,
      description,
      images: [
        {
          url: data.image || `https://picsum.photos/seed/cat-${decodedSlug}/1200/630`,
          width: 1200,
          height: 630,
          alt: `دسته‌بندی ${data.name} تک‌یاد`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.image || `https://picsum.photos/seed/cat-${decodedSlug}/1200/630`],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const contentData = await fetchCategoryContent(decodedSlug, resolvedSearchParams);

  if (!contentData || !contentData.category) {
    notFound();
  }

  const { category, breadcrumbs, children, courses, classes, totalCourses, totalClasses } = contentData;

  // JSON-LD Structured Data for BreadcrumbList
  const breadcrumbListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'خانه',
        item: 'https://tecyad.ir',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'دسته‌بندی‌ها',
        item: 'https://tecyad.ir/categories',
      },
      ...(breadcrumbs || []).map((b: any, idx: number) => ({
        '@type': 'ListItem',
        position: 3 + idx,
        name: b.name,
        item: `https://tecyad.ir/categories/${b.slug}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListJsonLd) }}
      />
      <CategoryPageClient
        category={category}
        breadcrumbs={breadcrumbs || []}
        children={children || []}
        initialCourses={courses || []}
        initialClasses={classes || []}
        totalCourses={totalCourses || 0}
        totalClasses={totalClasses || 0}
      />
    </>
  );
}
