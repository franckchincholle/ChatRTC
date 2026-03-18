import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import { Message, SendMessageDTO } from '@/types/message.types';

export const messageService = {
  getByChannelId: async (channelId: string): Promise<Message[]> => {
    const res = await apiClient.get<ApiResponse<Message[]>>(
      `/channels/${channelId}/messages`
    );
    return res.data;
  },

  send: async (channelId: string, data: SendMessageDTO): Promise<Message> => {
    const res = await apiClient.post<ApiResponse<Message>>(
      `/channels/${channelId}/messages`,
      data
    );
    return res.data;
  },

  update: async (channelId: string, messageId: string, data: { content: string }): Promise<Message> => {
    const res = await apiClient.put<ApiResponse<Message>>(
      `/channels/${channelId}/messages/${messageId}`,
      data
    );
    return res.data;
  },

  delete: async (channelId: string, messageId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(
      `/channels/${channelId}/messages/${messageId}`
    );
  },
};