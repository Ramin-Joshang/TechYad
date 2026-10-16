// Server-side data fetching utility for Next.js App Router (SSR)

const rawBackend = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';
const normalizedBackend = rawBackend.replace(/\/api\/?$/, '');
const INTERNAL_API_URL = `${normalizedBackend}/api`;

export interface ServerFetchOptions {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
}

export async function serverFetch<T = any>(
  endpoint: string,
  options?: ServerFetchOptions
): Promise<T | null> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${INTERNAL_API_URL}${cleanEndpoint}`;

  try {
    const fetchOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
      },
    };

    if (options?.revalidate === false || options?.revalidate === 0 || options?.cache === 'no-store') {
      fetchOptions.cache = 'no-store';
    } else {
      fetchOptions.next = {
        revalidate: typeof options?.revalidate === 'number' ? options.revalidate : 60,
        tags: options?.tags,
      };
    }

    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json && json.data !== undefined) {
      return json.data as T;
    }
    return json as T;
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE?.includes('build')) {
      // Build-time or offline development warning
      console.warn(`[SSR serverFetch offline/build: ${endpoint}]: Backend at ${INTERNAL_API_URL} not reachable.`);
    } else {
      console.error(`[SSR serverFetch error: ${endpoint}]:`, err?.message || err);
    }
    return null;
  }
}

// 1. Home / Landing Data
export async function fetchHomeData() {
  return serverFetch<any>('/home', { revalidate: 10, tags: ['home'] });
}

// 2. Courses
export async function fetchCourses(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    });
  }
  const endpoint = `/courses${query.toString() ? `?${query.toString()}` : ''}`;
  return serverFetch<any>(endpoint, { revalidate: 10, tags: ['courses'] });
}

export async function fetchCourse(slugOrId: string) {
  if (!slugOrId) return null;
  return serverFetch<any>(`/courses/${encodeURIComponent(slugOrId)}`, { revalidate: 10, tags: ['courses', `course-${slugOrId}`] });
}

// 3. Classes
export async function fetchClasses(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    });
  }
  const endpoint = `/classes${query.toString() ? `?${query.toString()}` : ''}`;
  return serverFetch<any>(endpoint, { revalidate: 10, tags: ['classes'] });
}

export async function fetchClass(slugOrId: string) {
  if (!slugOrId) return null;
  return serverFetch<any>(`/classes/${encodeURIComponent(slugOrId)}`, { revalidate: 10, tags: ['classes', `class-${slugOrId}`] });
}

// 4. Instructors
export async function fetchInstructors() {
  return serverFetch<any[]>('/instructors', { revalidate: 15, tags: ['instructors'] });
}

export async function fetchInstructor(idOrSlug: string) {
  if (!idOrSlug) return null;
  return serverFetch<any>(`/instructors/${encodeURIComponent(idOrSlug)}`, { revalidate: 15, tags: ['instructors', `instructor-${idOrSlug}`] });
}

// 5. Blog
export async function fetchArticles(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    });
  }
  const endpoint = `/blog/articles${query.toString() ? `?${query.toString()}` : ''}`;
  return serverFetch<any>(endpoint, { revalidate: 15, tags: ['blog'] });
}

export async function fetchArticle(slug: string) {
  if (!slug) return null;
  const res = await serverFetch<any>(`/blog/articles/${encodeURIComponent(slug)}`, { revalidate: 15, tags: ['blog', `article-${slug}`] });
  if (res) return res;
  return serverFetch<any>(`/blog/${encodeURIComponent(slug)}`, { revalidate: 15, tags: ['blog', `article-${slug}`] });
}

export async function fetchBlogCategories() {
  return serverFetch<any[]>('/blog/categories', { revalidate: 60, tags: ['blog-categories'] });
}

// 6. Categories & Taxonomies
export async function fetchCategories(params?: { tree?: boolean }) {
  const query = params?.tree ? '?tree=true' : '';
  return serverFetch<any[]>(`/categories${query}`, { revalidate: 30, tags: ['categories'] });
}

export async function fetchCategoryBySlug(slug: string) {
  if (!slug) return null;
  return serverFetch<any>(`/categories/slug/${encodeURIComponent(slug)}`, { revalidate: 15, tags: ['categories', `category-${slug}`] });
}

export async function fetchCategoryContent(slug: string, params?: Record<string, string | number | boolean | undefined>) {
  if (!slug) return null;
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        query.set(key, String(val));
      }
    });
  }
  const endpoint = `/categories/slug/${encodeURIComponent(slug)}/content${query.toString() ? `?${query.toString()}` : ''}`;
  return serverFetch<any>(endpoint, { revalidate: 10, tags: ['categories', `category-content-${slug}`] });
}

export async function fetchLevels() {
  return serverFetch<any[]>('/levels', { revalidate: 60, tags: ['levels'] });
}

export async function fetchPublicSettings() {
  return serverFetch<any>('/settings/public', { revalidate: 60, tags: ['settings'] });
}
