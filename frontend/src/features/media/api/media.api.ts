import { api } from '@/lib/api';

export const mediaApi = {
  uploadFile: async (file: File, folder: string = 'general') => {
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('file', file);
    return api.post<any, any>(`/upload?folder=${encodeURIComponent(folder)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteFile: async (url: string) => {
    return api.delete<any, any>('/delete', {
      params: { url },
      data: { url }
    });
  },
};
