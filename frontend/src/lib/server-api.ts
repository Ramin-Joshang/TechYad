// Server-side data fetching utility for Next.js App Router (SSR)

const INTERNAL_API_URL = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000/api/v1';

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
  } catch (err) {
    console.error(`[SSR serverFetch error: ${endpoint}]:`, err);
    return null;
  }
}

// 1. Home / Landing Data
export async function fetchHomeData() {
  return serverFetch<any>('/home', { revalidate: 60 });
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
  return serverFetch<any>(endpoint, { revalidate: 60 });
}

export async function fetchCourse(slugOrId: string) {
  if (!slugOrId) return null;
  return serverFetch<any>(`/courses/${encodeURIComponent(slugOrId)}`, { revalidate: 60 });
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
  return serverFetch<any>(endpoint, { revalidate: 60 });
}

export async function fetchClass(slugOrId: string) {
  if (!slugOrId) return null;
  return serverFetch<any>(`/classes/${encodeURIComponent(slugOrId)}`, { revalidate: 60 });
}

// 4. Instructors
export async function fetchInstructors() {
  return serverFetch<any[]>('/instructors', { revalidate: 120 });
}

export async function fetchInstructor(idOrSlug: string) {
  if (!idOrSlug) return null;
  return serverFetch<any>(`/instructors/${encodeURIComponent(idOrSlug)}`, { revalidate: 60 });
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
  return serverFetch<any>(endpoint, { revalidate: 60 });
}

export async function fetchArticle(slug: string) {
  if (!slug) return null;
  // Try /blog/articles/:slug first, fallback to /blog/:slug
  const res = await serverFetch<any>(`/blog/articles/${encodeURIComponent(slug)}`, { revalidate: 60 });
  if (res) return res;
  return serverFetch<any>(`/blog/${encodeURIComponent(slug)}`, { revalidate: 60 });
}

export async function fetchBlogCategories() {
  return serverFetch<any[]>('/blog/categories', { revalidate: 300 });
}

// 6. Categories & Taxonomies
export async function fetchCategories() {
  return serverFetch<any[]>('/categories', { revalidate: 300 });
}

export async function fetchLevels() {
  return serverFetch<any[]>('/levels', { revalidate: 300 });
}

export async function fetchPublicSettings() {
  return serverFetch<any>('/settings/public', { revalidate: 300 });
}
