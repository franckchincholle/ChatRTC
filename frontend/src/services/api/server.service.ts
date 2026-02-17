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

  getAll: async (): Promise<Server[]> => {
    const res = await apiClient.get<ApiResponse<Server[]>>('/api/servers');
    return res.data;
  },

  getById: async (id: string): Promise<Server> => {
    const res = await apiClient.get<ApiResponse<Server>>(`/api/servers/${id}`);
    return res.data;
  },

  create: async (data: CreateServerDTO): Promise<Server> => {
    const res = await apiClient.post<ApiResponse<Server>>('/api/servers', data);
    return res.data;
  },

  update: async (id: string, data: UpdateServerDTO): Promise<Server> => {
    const res = await apiClient.put<ApiResponse<Server>>(`/api/servers/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/servers/${id}`);
  },

  join: async (data: JoinServerDTO): Promise<ServerMember> => {
    const res = await apiClient.post<ApiResponse<ServerMember>>('/api/servers/join', data);
    return res.data;
  },

  leave: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/api/servers/${id}/leave`);
  },

  generateInviteCode: async (id: string): Promise<InviteCodeResponse> => {
    const res = await apiClient.post<ApiResponse<InviteCodeResponse>>(`/api/servers/${id}/invite`);
    return res.data;
  },
};