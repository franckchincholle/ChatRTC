import { apiClient } from './client';
import type { Member, UpdateMemberRoleDTO } from '@/types/member.types';
import type { ApiResponse } from '@/types/api.types';

export type BanDuration = '1w' | '2w' | '1m' | 'perm';

class MemberService {

  async getByServerId(serverId: string): Promise<Member[]> {
    const response = await apiClient.get<ApiResponse<{ members: Member[] }>>(
      `/servers/${serverId}/members`
    );
    return response.data.members;
  }

  async updateRole(serverId: string, userId: string, data: UpdateMemberRoleDTO): Promise<Member> {
    const response = await apiClient.put<ApiResponse<Member>>(
      `/api/servers/${serverId}/members/${userId}`,
      data
    );
    return response.data;
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