import { api } from '@/lib/api';

export interface SearchResult {
  courses: any[];
  classes: any[];
  articles: any[];
  instructors: any[];
}

export const searchApi = {
  globalSearch: async (q: string) => {
    return api.get<any, { success: boolean; data: SearchResult }>(`/search?q=${encodeURIComponent(q)}`);
  }
};
