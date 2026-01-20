import { create } from 'zustand';
import { api } from '@/services/api';

interface User {
  id: string;
  phone: string;
  email?: string;
  profile?: {
    display_name: string;
    activity_type: string;
    domain?: string;
    region: string;
    locality?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { phone: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(credentials);
      set({ user: response.user, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Login failed', 
        loading: false 
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const user = await api.register(data);
      set({ user, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Registration failed', 
        loading: false 
      });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
  
  clearError: () => set({ error: null }),
}));
