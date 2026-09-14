import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const supportApi = {
  getMyTickets: async () => {
    return api.get<any, ApiResponse<any[]>>('/support/tickets');
  },
  getTicketDetails: async (id: string) => {
    return api.get<any, ApiResponse<any>>(`/support/tickets/${id}`);
  },
  createTicket: async (data: { subject: string, category?: string, priority?: string, message: string }) => {
    return api.post<any, ApiResponse<any>>('/support/tickets', data);
  },
  replyToTicket: async (id: string, data: { message: string }) => {
    return api.post<any, ApiResponse<any>>(`/support/tickets/${id}/reply`, data);
  }
};
