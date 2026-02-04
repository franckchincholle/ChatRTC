// Message API Service
import { apiClient } from './client';
import { Message, SendMessageDTO } from '@/types/message.types';

export const messageService = {
  /**
   * Get messages for a channel
   */
  getByChannelId: async (
    channelId: string,
    limit?: number,
    before?: string
  ): Promise<Message[]> => {
    const params: Record<string, string> = {};
    if (limit) params.limit = limit.toString();
    if (before) params.before = before;

    return apiClient.get<Message[]>(`/channels/${channelId}/messages`, {
      params,
    });
  },

  /**
   * Send a message to a channel
   */
  send: async (channelId: string, data: SendMessageDTO): Promise<Message> => {
    return apiClient.post<Message>(`/channels/${channelId}/messages`, data);
  },

  /**
   * Delete a message
   */
  delete: async (messageId: string): Promise<void> => {
    return apiClient.delete<void>(`/messages/${messageId}`);
  },

  /**
   * Update/Edit a message
   */
  update: async (messageId: string, data: SendMessageDTO): Promise<Message> => {
    return apiClient.put<Message>(`/messages/${messageId}`, data);
  },
};