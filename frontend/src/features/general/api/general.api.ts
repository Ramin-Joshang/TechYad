import { api } from '@/lib/api';

export const generalApi = {
  // FAQs
  getFaqs: async () => {
    return api.get('/faqs');
  },
  getAllFaqsAdmin: async () => {
    return api.get('/admin/faqs');
  },
  createFaq: async (data: any) => {
    return api.post('/admin/faqs', data);
  },
  updateFaq: async (id: string, data: any) => {
    return api.put(`/admin/faqs/${id}`, data);
  },
  deleteFaq: async (id: string) => {
    return api.delete(`/admin/faqs/${id}`);
  },

  // Contact Messages
  submitContact: async (data: any) => {
    return api.post('/contact', data);
  },
  getContactsAdmin: async (params?: any) => {
    return api.get('/admin/contacts', { params });
  },
  updateContactStatus: async (id: string, data: any) => {
    return api.patch(`/admin/contacts/${id}`, data);
  },
  deleteContact: async (id: string) => {
    return api.delete(`/admin/contacts/${id}`);
  },

  // Job Positions (Careers)
  getJobPositions: async () => {
    return api.get('/careers/positions');
  },
  getAllJobPositionsAdmin: async () => {
    return api.get('/admin/careers/positions');
  },
  createJobPosition: async (data: any) => {
    return api.post('/admin/careers/positions', data);
  },
  updateJobPosition: async (id: string, data: any) => {
    return api.put(`/admin/careers/positions/${id}`, data);
  },
  deleteJobPosition: async (id: string) => {
    return api.delete(`/admin/careers/positions/${id}`);
  },

  // Career Applications
  submitCareer: async (data: any) => {
    return api.post('/careers', data);
  },
  getCareerApplicationsAdmin: async (params?: any) => {
    return api.get('/admin/careers/applications', { params });
  },
  updateCareerApplicationStatus: async (id: string, data: any) => {
    return api.patch(`/admin/careers/applications/${id}`, data);
  },
  deleteCareerApplication: async (id: string) => {
    return api.delete(`/admin/careers/applications/${id}`);
  },

  // Testimonials
  getAllTestimonialsAdmin: async () => {
    return api.get('/home/admin/testimonials');
  },
  createTestimonial: async (data: any) => {
    return api.post('/home/admin/testimonials', data);
  },
  updateTestimonial: async (id: string, data: any) => {
    return api.put(`/home/admin/testimonials/${id}`, data);
  },
  deleteTestimonial: async (id: string) => {
    return api.delete(`/home/admin/testimonials/${id}`);
  }
};
