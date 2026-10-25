import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

interface UserProfile {
  display_name: string;
  activity_type: string;
  domain?: string;
  region: string;
  locality?: string;
}

interface User {
  id: string;
  phone: string;
  email?: string | null;
  status?: string;
  profile?: UserProfile | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { phone: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  resetLoading: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await api.login(credentials);

          // ✅ Store tokens in localStorage so axios interceptor attaches them to all requests
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }

          set({ user: response.user, token: response.access_token, loading: false, error: null });
        } catch (error: any) {
          const detail = error?.response?.data?.detail;
          const connectionFailed = ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'].includes(error?.code)
            || error?.message === 'Network Error';
          const message = typeof detail === 'string'
            ? detail
            : connectionFailed
              ? 'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.'
              : error?.message || 'Identifiants incorrects. Vérifiez votre téléphone et mot de passe.';
          set({ error: message, loading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await api.register(data);

          // ✅ Backend now returns LoginResponse on register (access_token + user)
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }

          // Handle both LoginResponse (new) and UserWithProfile (legacy) response shapes
          const user = response.user ?? response;
          const token = response.access_token ?? null;

          set({ user, token, loading: false, error: null });
        } catch (error: any) {
          const detail = error?.response?.data?.detail;
          let message: string;
          if (typeof detail === 'string') {
            message = detail;
          } else if (Array.isArray(detail)) {
            // Pydantic validation errors
            message = detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
          } else {
            message = ['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'].includes(error?.code)
              || error?.message === 'Network Error'
              ? "Le serveur ne répond pas. Vérifiez votre connexion et réessayez."
              : error?.message || 'Inscription échouée. Vérifiez vos informations.';
          }
          set({ error: message, loading: false });
          throw error;
        }
      },

      logout: () => {
        api.logout();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, token: null, error: null });
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),

      resetLoading: () => set({ loading: false }),
    }),
    {
      name: 'mboa-auth-storage',
      // Only persist user and token (not transient state)
      partialize: (state) => ({ user: state.user, token: state.token }),
      // Re-sync persisted token back to localStorage on page reload
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('access_token', state.token);
        }
      },
    }
  )
);
