import httpClient from './client';
import type { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth.types';

const persistAuthTokens = (payload: Partial<LoginResponse> | null | undefined) => {
  if (!payload) return;

  if (payload.access_token) {
    localStorage.setItem('access_token', payload.access_token);
  }

  if (payload.refresh_token) {
    localStorage.setItem('refresh_token', payload.refresh_token);
  }
};

export const authApi = {
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await httpClient.post('/auth/register', data);
    persistAuthTokens(response.data);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post('/auth/login', credentials);
    persistAuthTokens(response.data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
