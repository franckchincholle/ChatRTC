// Auth API Service
import { apiClient } from './client';
import {
  User,
  AuthResponse,
  LoginDTO,
  SignupDTO,
} from '@/types/user.types';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  /**
   * Signup with email, username and password
   */
  signup: async (data: SignupDTO): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },
};