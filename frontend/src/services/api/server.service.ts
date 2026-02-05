// Server API Service
import { apiClient } from './client';
import {
  Server,
  CreateServerDTO,
  UpdateServerDTO,
  JoinServerDTO,
  InviteCodeResponse,
} from '@/types/server.types';

export const serverService = {
  /**
   * Get all servers for the current user
   */
  getAll: async (): Promise<Server[]> => {
    return apiClient.get<Server[]>('/servers');
  },

  /**
   * Get a specific server by ID
   */
  getById: async (id: string): Promise<Server> => {
    return apiClient.get<Server>(`/servers/${id}`);
  },

  /**
   * Create a new server
   */
  create: async (data: CreateServerDTO): Promise<Server> => {
    return apiClient.post<Server>('/servers', data);
  },

  /**
   * Update a server
   */
  update: async (id: string, data: UpdateServerDTO): Promise<Server> => {
    return apiClient.put<Server>(`/servers/${id}`, data);
  },

  /**
   * Delete a server
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/servers/${id}`);
  },

  /**
   * Join a server with an invite code
   */
  join: async (data: JoinServerDTO): Promise<Server> => {
    return apiClient.post<Server>('/servers/join', data);
  },

  /**
   * Leave a server
   */
  leave: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/servers/${id}/leave`);
  },

  /**
   * Generate an invite code for a server
   */
  generateInviteCode: async (id: string): Promise<InviteCodeResponse> => {
    return apiClient.post<InviteCodeResponse>(`/servers/${id}/invite`);
  },
};