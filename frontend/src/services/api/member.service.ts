import { apiClient } from './client';
import type { Member, MemberRole, UpdateMemberRoleDTO } from '@/types/member.types';

class MemberService {
  /**
   * Récupérer les membres d'un serveur
   */
  async getByServerId(serverId: string): Promise<Member[]> {
    const response = await apiClient.get<{ data: { members: any[] } }>(
      `/servers/${serverId}/members`
    );
    
    // Transformer la réponse backend en Member frontend (avec isOnline = false par défaut)
    return response.data.members.map((m) => ({
      userId: m.userId,
      serverId: m.serverId,
      username: m.username,
      role: m.role,
      isOnline: m.isOnline,  // Sera mis à jour par Socket.IO
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Mettre à jour le rôle d'un membre
   */
  async updateRole(
    serverId: string,
    userId: string,
    data: UpdateMemberRoleDTO
  ): Promise<Member> {
    const response = await apiClient.put<{ data: any }>(
      `/api/servers/${serverId}/members/${userId}`,
      data
    );
    return {
      userId: response.data.userId,
      serverId: response.data.serverId,
      username: response.data.user?.username || '',
      role: response.data.role,
      isOnline: false,
      joinedAt: response.data.joinedAt,
    };
  }
}

export const memberService = new MemberService();