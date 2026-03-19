import { apiClient } from './client';
import type { ApiResponse } from '@/types/api.types';
import type { Reaction } from '@/types/message.types';

interface ToggleReactionDTO {
  emoji: string;
}

interface ToggleReactionResponse {
  action: 'added' | 'removed' | 'changed';
  reaction: Reaction;
}

export const reactionService = {
  toggle: async (
    channelId: string,
    messageId: string,
    data: ToggleReactionDTO
  ): Promise<ToggleReactionResponse> => {
    const res = await apiClient.post<ApiResponse<ToggleReactionResponse>>(
      `/channels/${channelId}/messages/${messageId}/reactions`,
      data
    );
    return res.data;
  },
};