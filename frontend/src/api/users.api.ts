import httpClient from './client';
import type { User, UserProfile } from '../types/auth.types';

export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<User> => {
    const response = await httpClient.put('/users/me/profile', data);
    return response.data;
  },
};
