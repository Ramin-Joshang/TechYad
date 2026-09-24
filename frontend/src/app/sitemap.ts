import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tekyad.ir';
  const currentDate = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/classes`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instructors`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic courses
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/courses?limit=100', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const courses = data?.data?.courses || data?.data || [];
      courseRoutes = courses.map((c: any) => ({
        url: `${baseUrl}/courses/${c.slug || c._id}`,
        lastModified: c.updatedAt || currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
    }
  } catch (err) {
    // Fail silently in build/dev if backend is not yet populated
  }

  // Dynamic classes
  let classRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/classes?limit=100', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const classes = data?.data?.classes || data?.data || [];
      classRoutes = classes.map((c: any) => ({
        url: `${baseUrl}/classes/${c.slug || c._id}`,
        lastModified: c.updatedAt || currentDate,
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
    }
  } catch (err) {
    // Fail silently in build/dev if backend is not yet populated
  }

  // Dynamic blog articles
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/blog?limit=100', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const articles = data?.data || [];
      blogRoutes = articles.map((a: any) => ({
        url: `${baseUrl}/blog/${a.slug || a._id}`,
        lastModified: a.updatedAt || currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (err) {
    // Fail silently in build/dev if backend is not yet populated
  }

  return [...staticRoutes, ...courseRoutes, ...classRoutes, ...blogRoutes];
}
