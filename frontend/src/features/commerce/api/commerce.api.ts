import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const commerceApi = {
  getCart: async () => {
    return api.get<any, ApiResponse<any>>('/me/cart');
  },
  addToCart: async (itemType: 'course' | 'class', itemId: string) => {
    return api.post<any, ApiResponse<any>>('/me/cart/items', { itemType, itemId });
  },
  removeFromCart: async (itemId: string) => {
    return api.delete<any, ApiResponse<any>>(`/me/cart/items/${itemId}`);
  },
  clearCart: async () => {
    return api.delete<any, ApiResponse<any>>('/me/cart');
  },
  checkoutPreview: async (couponCode?: string) => {
    return api.post<any, ApiResponse<any>>('/checkout/preview', { couponCode });
  },
  createOrder: async (couponCode?: string, useWallet?: boolean) => {
    return api.post<any, ApiResponse<any>>('/checkout/create', { couponCode, useWallet });
  },
  createMockPayment: async (orderId: string) => {
    return api.post<any, ApiResponse<any>>(`/payments/${orderId}/create`);
  },
  verifyMockPayment: async (authority: string, status: 'OK' | 'NOK') => {
    return api.post<any, ApiResponse<any>>('/payments/verify', { authority, status });
  },
  getMyOrders: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/orders');
  },
  getOrderById: async (id: string) => {
    return api.get<any, ApiResponse<any>>(`/me/orders/${id}`);
  }
};
