import { serverMemberRepository, ServerMemberWithUser } from '../repositories/server-member.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { MemberResponse } from '../types/member.types';
import { SocketManager } from '../sockets/socket.manager';

export class MemberService {
  async getServerMembers(userId: string, serverId: string): Promise<MemberResponse[]> {
    const isMember = await serverMemberRepository.isMember(userId, serverId);
    if (!isMember) {
      throw new ForbiddenError('You are not a member of this server');
    }

    const members = await serverMemberRepository.findByServerId(serverId);

    const onlineUsers = SocketManager.getOnlineUsers(serverId);

    return members.map((member) => ({
      userId: member.userId,
      serverId: member.serverId,
      username: member.user.username,  
      role: member.role as 'OWNER' | 'ADMIN' | 'MEMBER',
      joinedAt: member.joinedAt.toISOString(),
      isOnline: onlineUsers.includes(member.userId),
    }));
  }
}

export const memberService = new MemberService();