// Server API Service
import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import {
  Server,
  ServerMember,
  CreateServerDTO,
  UpdateServerDTO,
  JoinServerDTO,
  InviteCodeResponse,
} from '@/types/server.types';

export const serverService = {
  /**
   * Récupérer tous les serveurs de l'utilisateur connecté
   */
  getAll: async (): Promise<Server[]> => {
    const res = await apiClient.get<ApiResponse<Server[]>>('/api/servers');
    return res.data;
  },

  /**
   * Récupérer un serveur par ID
   */
  getById: async (id: string): Promise<Server> => {
    const res = await apiClient.get<ApiResponse<Server>>(`/api/servers/${id}`);
    return res.data;
  },

  /**
   * Créer un nouveau serveur
   */
  create: async (data: CreateServerDTO): Promise<Server> => {
    const res = await apiClient.post<ApiResponse<Server>>('/api/servers', data);
    return res.data;
  },

  /**
   * Mettre à jour un serveur
   */
  update: async (id: string, data: UpdateServerDTO): Promise<Server> => {
    const res = await apiClient.put<ApiResponse<Server>>(`/api/servers/${id}`, data);
    return res.data;
  },

  /**
   * Supprimer un serveur
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/servers/${id}`);
  },

  /**
   * Rejoindre un serveur avec un code d'invitation
   * ⚠️ Le backend retourne un ServerMember, pas un Server
   */
  join: async (data: JoinServerDTO): Promise<ServerMember> => {
    const res = await apiClient.post<ApiResponse<ServerMember>>('/api/servers/join', data);
    return res.data;
  },

  /**
   * Quitter un serveur
   */
  leave: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/servers/${id}/leave`);
  },

  /**
   * Générer un code d'invitation pour un serveur
   */
  generateInviteCode: async (id: string): Promise<InviteCodeResponse> => {
    const res = await apiClient.post<ApiResponse<InviteCodeResponse>>(`/api/servers/${id}/invite`);
    return res.data;
  },
};