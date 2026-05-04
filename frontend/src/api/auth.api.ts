import httpClient from './client';
import type { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await httpClient.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
