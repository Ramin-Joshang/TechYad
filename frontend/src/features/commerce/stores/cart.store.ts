import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  itemType: 'course' | 'class';
  itemId: string;
  title?: string;
  titleSnapshot?: string;
  thumbnail?: string;
  instructorName?: string;
  price?: number;
  discount?: number;
  finalPrice?: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  hasHydrated: boolean;
  setCart: (data: { items: CartItem[]; subtotal?: number; discountAmount?: number; totalAmount?: number }) => void;
  clearCart: () => void;
  setHasHydrated: (status: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      subtotal: 0,
      discountAmount: 0,
      totalAmount: 0,
      hasHydrated: false,
      setCart: (data) =>
        set({
          items: data?.items || [],
          subtotal: data?.subtotal || 0,
          discountAmount: data?.discountAmount || 0,
          totalAmount: data?.totalAmount || 0,
        }),
      clearCart: () =>
        set({
          items: [],
          subtotal: 0,
          discountAmount: 0,
          totalAmount: 0,
        }),
      setHasHydrated: (status) => set({ hasHydrated: status }),
    }),
    {
      name: 'techyad_cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
