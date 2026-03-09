import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import { 
  Channel, 
  CreateChannelDTO, 
  UpdateChannelDTO 
} from '@/types/channel.types';

export const channelService = {

  getByServerId: async (serverId: string): Promise<Channel[]> => {
    const res = await apiClient.get<ApiResponse<{ channels: Channel[] }>>(`/servers/${serverId}/channels`);
    return res.data.channels;
  },

  getById: async (id: string): Promise<Channel> => {
    const res = await apiClient.get<ApiResponse<{ channel: Channel }>>(`/channels/${id}`);
    return res.data.channel;
  },

  create: async (serverId: string, data: CreateChannelDTO): Promise<Channel> => {
    const res = await apiClient.post<ApiResponse<{ channel: Channel }>>(`/servers/${serverId}/channels`, data);
    return res.data.channel;
  },

  update: async (id: string, data: UpdateChannelDTO): Promise<Channel> => {
    const res = await apiClient.put<ApiResponse<{ channel: Channel }>>(`/channels/${id}`, data);
    return res.data.channel;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/channels/${id}`);
  },
};