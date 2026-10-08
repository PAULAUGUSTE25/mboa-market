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
  email?: string;
  status?: string;
  profile?: UserProfile;
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
          const response = await Promise.race([
            api.login(credentials),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Le serveur met trop de temps à répondre. Il est peut-être en cours de démarrage, réessayez dans 30 secondes.'));
              }, 65000); // 65s — matches axios timeout + buffer for Render cold starts
            }),
          ]);

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
          const message =
            typeof detail === 'string'
              ? detail
              : error?.message || 'Identifiants incorrects. Vérifiez votre téléphone et mot de passe.';
          set({ error: message, loading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await Promise.race([
            api.register(data),
            new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error("L'inscription met trop de temps à répondre. Le serveur est peut-être en cours de démarrage, réessayez dans 30 secondes."));
              }, 65000); // 65s — matches axios timeout + buffer for Render cold starts
            }),
          ]);

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
            message = error?.message || 'Inscription échouée. Vérifiez vos informations.';
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
