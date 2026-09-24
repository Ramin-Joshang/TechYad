import { BlogPostContainer } from '@/components/blog/BlogPostContainer';
import type { Metadata } from 'next';

async function fetchArticleData(identifier: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/v1/blog/${encodeURIComponent(identifier)}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const article = await fetchArticleData(slug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tekyad.ir';
  const pageUrl = `${baseUrl}/blog/${encodeURIComponent(slug)}`;

  if (!article) {
    return {
      title: 'مقاله تخصصی | وبلاگ تک‌یاد',
      description: 'جدیدترین مقالات آموزشی، راهنماهای برنامه‌نویسی و فناوری در وبلاگ تک‌یاد.',
    };
  }

  const title = `${article.title} | وبلاگ تک‌یاد`;
  const rawExcerpt = article.excerpt || article.content || '';
  const cleanExcerpt = rawExcerpt.replace(/<[^>]*>/g, '').slice(0, 155);
  const description = cleanExcerpt.length > 50
    ? `${cleanExcerpt}...`
    : `مطالعه مقاله تخصصی ${article.title} در وبلاگ تک‌یاد و ارتقای دانش مهندسی و نرم‌افزار.`;

  const imageUrl = article.thumbnail || `${baseUrl}/images/blog-default.jpg`;
  const authorName = `${article.author?.firstName || 'تیم'} ${article.author?.lastName || 'تک‌یاد'}`.trim();

  return {
    title,
    description,
    authors: [{ name: authorName }],
    keywords: [
      article.title,
      article.category?.name || 'آموزش برنامه‌نویسی',
      ...(article.tags || []),
      'وبلاگ آموزشی',
      'تک‌یاد',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      url: pageUrl,
      title,
      description,
      siteName: 'تک‌یاد',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt || article.createdAt,
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  const article = await fetchArticleData(resolvedParams.slug);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tekyad.ir';
  const pageUrl = `${baseUrl}/blog/${encodeURIComponent(resolvedParams.slug)}`;

  const blogJsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": (article.excerpt || article.content || '').replace(/<[^>]*>/g, '').slice(0, 300),
    "image": article.thumbnail || `${baseUrl}/images/blog-default.jpg`,
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt || article.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "author": {
      "@type": "Person",
      "name": `${article.author?.firstName || 'تیم'} ${article.author?.lastName || 'تک‌یاد'}`.trim()
    },
    "publisher": {
      "@type": "EducationalOrganization",
      "name": "تک‌یاد",
      "url": "https://tekyad.ir",
      "logo": {
        "@type": "ImageObject",
        "url": "https://picsum.photos/seed/tekyad-logo/512/512"
      }
    }
  } : null;

  return (
    <>
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      )}
      <BlogPostContainer slug={resolvedParams.slug} />
    </>
  );
}
