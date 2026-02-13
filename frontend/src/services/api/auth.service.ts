// Auth API Service
import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import { User, AuthData, LoginDTO, SignupDTO } from '@/types/user.types';

export const authService = {
  /**
   * Connexion avec email et mot de passe
   */
  login: async (data: LoginDTO): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/login', data);
    return res.data;
  },

  /**
   * Inscription
   */
  signup: async (data: SignupDTO): Promise<AuthData> => {
    const res = await apiClient.post<ApiResponse<AuthData>>('/auth/signup', data);
    return res.data;
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  /**
   * Récupérer l'utilisateur connecté
   */
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.user;
  },
};