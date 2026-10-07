import { MetadataRoute } from 'next';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://tecyad.ir').replace(/\/+$/, '');
  const currentDate = new Date().toISOString();

  // Core Static Public Pages
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
      priority: 0.95,
    },
    {
      url: `${baseUrl}/classes`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/instructors`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const seenUrls = new Set<string>(staticRoutes.map(r => r.url));

  // Dynamic Courses Fetching
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/courses?limit=500&status=published', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const courses = data?.data?.courses || data?.data || [];
      if (Array.isArray(courses)) {
        for (const c of courses) {
          const slugOrId = c.slug || c._id;
          if (!slugOrId) continue;
          const url = `${baseUrl}/courses/${encodeURIComponent(slugOrId)}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            courseRoutes.push({
              url,
              lastModified: c.updatedAt || c.createdAt || currentDate,
              changeFrequency: 'weekly',
              priority: 0.9,
            });
          }
        }
      }
    }
  } catch (err) {
    // Fail silently in build if backend not populated
  }

  // Dynamic Classes Fetching
  let classRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/classes?limit=500', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const classes = data?.data?.classes || data?.data || [];
      if (Array.isArray(classes)) {
        for (const c of classes) {
          const slugOrId = c.slug || c._id;
          if (!slugOrId) continue;
          const url = `${baseUrl}/classes/${encodeURIComponent(slugOrId)}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            classRoutes.push({
              url,
              lastModified: c.updatedAt || c.createdAt || currentDate,
              changeFrequency: 'weekly',
              priority: 0.85,
            });
          }
        }
      }
    }
  } catch (err) {
    // Fail silently
  }

  // Dynamic Instructors Fetching
  let instructorRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/instructors?limit=200', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const instructors = data?.data || [];
      if (Array.isArray(instructors)) {
        for (const inst of instructors) {
          const id = inst._id || inst.id;
          if (!id) continue;
          const url = `${baseUrl}/instructors/${encodeURIComponent(id)}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            instructorRoutes.push({
              url,
              lastModified: inst.updatedAt || currentDate,
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (err) {
    // Fail silently
  }

  // Dynamic Blog Posts Fetching
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch('http://localhost:5000/api/v1/blog?limit=500&status=published', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const articles = data?.data?.articles || data?.data || [];
      if (Array.isArray(articles)) {
        for (const a of articles) {
          const slugOrId = a.slug || a._id;
          if (!slugOrId) continue;
          const url = `${baseUrl}/blog/${encodeURIComponent(slugOrId)}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            blogRoutes.push({
              url,
              lastModified: a.updatedAt || a.createdAt || currentDate,
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (err) {
    // Fail silently
  }

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...classRoutes,
    ...instructorRoutes,
    ...blogRoutes,
  ];
}
