import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import { User, AuthData, LoginDTO, SignupDTO } from '@/types/user.types';

export const authService = {

  login: async (data: LoginDTO): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/login', data);
    return res.data;
  },

  signup: async (data: SignupDTO): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/signup', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.user;
  },
};