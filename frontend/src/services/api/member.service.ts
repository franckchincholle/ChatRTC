import { apiClient } from './client';
import type { Member, MemberRole, UpdateMemberRoleDTO } from '@/types/member.types';

export type BanDuration = '1w' | '2w' | '1m' | 'perm';

class MemberService {

  async getByServerId(serverId: string): Promise<Member[]> {
    const response = await apiClient.get<{ data: { members: any[] } }>(
      `/servers/${serverId}/members`
    );
    return response.data.members.map((m) => ({
      userId:   m.userId,
      serverId: m.serverId,
      username: m.username,
      role:     m.role,
      isOnline: m.isOnline,
      joinedAt: m.joinedAt,
      isBanned: m.isBanned ?? false,
    }));
  }

  async updateRole(serverId: string, userId: string, data: UpdateMemberRoleDTO): Promise<Member> {
    const response = await apiClient.put<{ data: any }>(
      `/api/servers/${serverId}/members/${userId}`,
      data
    );
    return {
      userId:   response.data.userId,
      serverId: response.data.serverId,
      username: response.data.user?.username || '',
      role:     response.data.role,
      isOnline: false,
      joinedAt: response.data.joinedAt,
      isBanned: response.data.isBanned ?? false,
    };
  }

  async kick(serverId: string, userId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/members/${userId}/kick`);
  }

  async ban(serverId: string, userId: string, duration: BanDuration): Promise<void> {
    await apiClient.post(`/servers/${serverId}/members/${userId}/ban`, { duration });
  }

  async unban(serverId: string, userId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/members/${userId}/ban`);
  }
}

export const memberService = new MemberService();