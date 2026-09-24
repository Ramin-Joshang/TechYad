import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string; // the backend returns id in login/getMe response
  firstName: string;
  lastName: string;
  email: string;
  role: 'super-admin' | 'admin' | 'instructor' | 'student';
  avatar?: string;
  permissions?: string[]; // E.g., 'courses.manage', 'courses.publish', etc.
  referralCode?: string;
  walletBalance?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  hasHydrated: boolean;
  setAuth: (user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setInitializing: (status: boolean) => void;
  setHasHydrated: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      hasHydrated: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isInitializing: false });
      },
      updateUser: (updatedUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, isInitializing: false });
      },
      setInitializing: (status) => set({ isInitializing: status }),
      setHasHydrated: (status) => set({ hasHydrated: status }),
    }),
    {
      name: 'tecyad_auth',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          const old = localStorage.getItem('techyad_auth');
          if (old && !localStorage.getItem('tecyad_auth')) {
            localStorage.setItem('tecyad_auth', old);
          }
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.user) {
          state.setInitializing(false);
        }
      },
    }
  )
);
