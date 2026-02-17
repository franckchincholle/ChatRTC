// // Message API Service
// import { apiClient } from './client';
// import { Message, SendMessageDTO } from '@/types/message.types';

// export const messageService = {
//   /**
//    * Get messages for a channel
//    */
//   getByChannelId: async (
//     channelId: string,
//     limit?: number,
//     before?: string
//   ): Promise<Message[]> => {
//     const params: Record<string, string> = {};
//     if (limit) params.limit = limit.toString();
//     if (before) params.before = before;

//     return apiClient.get<Message[]>(`/channels/${channelId}/messages`, {
//       params,
//     });
//   },

//   /**
//    * Send a message to a channel
//    */
//   send: async (channelId: string, data: SendMessageDTO): Promise<Message> => {
//     return apiClient.post<Message>(`/channels/${channelId}/messages`, data);
//   },

//   /**
//    * Delete a message
//    */
//   delete: async (messageId: string): Promise<void> => {
//     return apiClient.delete<void>(`/messages/${messageId}`);
//   },

//   /**
//    * Update/Edit a message
//    */
//   update: async (messageId: string, data: SendMessageDTO): Promise<Message> => {
//     return apiClient.put<Message>(`/messages/${messageId}`, data);
//   },
// };

// Message API Service
import { apiClient } from './client';
import { ApiResponse } from '@/types/api.types';
import { Message, SendMessageDTO } from '@/types/message.types';

export const messageService = {
  /**
   * Récupérer les messages d'un channel
   */
  getByChannelId: async (channelId: string): Promise<Message[]> => {
    const res = await apiClient.get<ApiResponse<Message[]>>(
      `/channels/${channelId}/messages`
    );
    return res.data;
  },

  /**
   * Envoyer un message dans un channel
   */
  send: async (channelId: string, data: SendMessageDTO): Promise<Message> => {
    const res = await apiClient.post<ApiResponse<Message>>(
      `/channels/${channelId}/messages`,
      data
    );
    return res.data;
  },

  /**
   * Modifier un message
   */
  // update: async (channelId: string, messageId: string): Promise<Message> => {
  //   const res = await apiClient.put<ApiResponse<Message>>(
  //     `/channels/${channelId}/messages/${messageId}`,
  //     data
  //   );
  //   return res.data;
  // },

  /**
   * Supprimer un message
   */
  delete: async (channelId: string, messageId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(
      `/channels/${channelId}/messages/${messageId}`
    );
  },

};