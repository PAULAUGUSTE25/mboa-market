import httpClient from './client';
import type { User } from '../types/auth.types';

export interface UpdateProfileRequest {
  display_name?: string;
  email?: string | null;
  activity_type?: string;
  region?: string;
  locality?: string | null;
  bio?: string | null;
}

export const usersApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await httpClient.put('/users/me/profile', data);
    return response.data;
  },
};
