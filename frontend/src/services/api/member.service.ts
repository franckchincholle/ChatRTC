// Member API Service
import { apiClient } from './client';
import { Member, UpdateMemberRoleDTO } from '@/types/member.types';

export const memberService = {
  /**
   * Get all members of a server
   */
  getByServerId: async (serverId: string): Promise<Member[]> => {
    return apiClient.get<Member[]>(`/servers/${serverId}/members`);
  },

  /**
   * Update a member's role
   */
  updateRole: async (
    serverId: string,
    userId: string,
    data: UpdateMemberRoleDTO
  ): Promise<Member> => {
    return apiClient.put<Member>(
      `/servers/${serverId}/members/${userId}`,
      data
    );
  },

  /**
   * Kick a member from a server
   */
  kick: async (serverId: string, userId: string): Promise<void> => {
    return apiClient.delete<void>(`/servers/${serverId}/members/${userId}`);
  },

  /**
   * Ban a member from a server
   */
  ban: async (
    serverId: string,
    userId: string,
    permanent?: boolean
  ): Promise<void> => {
    return apiClient.post<void>(`/servers/${serverId}/bans`, {
      userId,
      permanent,
    });
  },

  /**
   * Unban a member from a server
   */
  unban: async (serverId: string, userId: string): Promise<void> => {
    return apiClient.delete<void>(`/servers/${serverId}/bans/${userId}`);
  },
};