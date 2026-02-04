// Channel API Service
import { apiClient } from './client';
import {
  Channel,
  CreateChannelDTO,
  UpdateChannelDTO,
} from '@/types/channel.types';

export const channelService = {
  /**
   * Get all channels for a server
   */
  getByServerId: async (serverId: string): Promise<Channel[]> => {
    return apiClient.get<Channel[]>(`/servers/${serverId}/channels`);
  },

  /**
   * Get a specific channel by ID
   */
  getById: async (id: string): Promise<Channel> => {
    return apiClient.get<Channel>(`/channels/${id}`);
  },

  /**
   * Create a new channel in a server
   */
  create: async (serverId: string, data: CreateChannelDTO): Promise<Channel> => {
    return apiClient.post<Channel>(`/servers/${serverId}/channels`, data);
  },

  /**
   * Update a channel
   */
  update: async (id: string, data: UpdateChannelDTO): Promise<Channel> => {
    return apiClient.put<Channel>(`/channels/${id}`, data);
  },

  /**
   * Delete a channel
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/channels/${id}`);
  },
};