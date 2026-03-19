import { serverMemberRepository } from '../repositories/server-member.repository';
import { serverBanRepository, BanDuration } from '../repositories/server-ban.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { MemberResponse } from '../types/member.types';
import { SocketManager } from '../sockets/socket.manager';

export class MemberService {

  async getServerMembers(userId: string, serverId: string): Promise<MemberResponse[]> {
    const isMember = await serverMemberRepository.isMember(userId, serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    const [members, bannedIds, onlineUsers] = await Promise.all([
      serverMemberRepository.findByServerId(serverId),
      serverBanRepository.findBannedUserIdsByServer(serverId),
      Promise.resolve(SocketManager.getOnlineUsers(serverId)),
    ]);

    return members.map((member) => ({
      userId:   member.userId,
      serverId: member.serverId,
      username: member.user.username,
      role:     member.role as 'OWNER' | 'ADMIN' | 'MEMBER',
      joinedAt: member.joinedAt.toISOString(),
      isOnline: onlineUsers.includes(member.userId),
      isBanned: bannedIds.has(member.userId),
    }));
  }

  async kickMember(requesterId: string, serverId: string, targetUserId: string): Promise<void> {
    await this._assertCanManage(requesterId, serverId, targetUserId);
    await serverMemberRepository.removeMember(targetUserId, serverId);
    SocketManager.emitMemberKicked(serverId, targetUserId);
  }

  async banMember(requesterId: string, serverId: string, targetUserId: string, duration: BanDuration): Promise<void> {
    await this._assertCanManage(requesterId, serverId, targetUserId);
    await serverBanRepository.ban(targetUserId, serverId, requesterId, duration);
    await serverMemberRepository.removeMember(targetUserId, serverId).catch(() => {});
    SocketManager.emitMemberBanned(serverId, targetUserId);
  }

  async unbanMember(requesterId: string, serverId: string, targetUserId: string): Promise<void> {
    const requester = await serverMemberRepository.findByUserAndServer(requesterId, serverId);
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
      throw new ForbiddenError('Admin or owner privileges required');
    }
    // Supprimer le ban
    await serverBanRepository.unban(targetUserId, serverId);
    // Réinscrire l'utilisateur comme membre (s'il n'est pas déjà dans le serveur)
    const existingMember = await serverMemberRepository.findByUserAndServer(targetUserId, serverId);
    if (!existingMember) {
      await serverMemberRepository.addMember(targetUserId, serverId, 'MEMBER');
    }
    SocketManager.emitMemberUnbanned(serverId, targetUserId);
  }

  private async _assertCanManage(requesterId: string, serverId: string, targetUserId: string): Promise<void> {
    if (requesterId === targetUserId) throw new ForbiddenError('You cannot perform this action on yourself');

    const [requester, target] = await Promise.all([
      serverMemberRepository.findByUserAndServer(requesterId, serverId),
      serverMemberRepository.findByUserAndServer(targetUserId, serverId),
    ]);

    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
      throw new ForbiddenError('Admin or owner privileges required');
    }
    if (!target) throw new NotFoundError('Member not found in this server');
    if (requester.role === 'ADMIN' && (target.role === 'ADMIN' || target.role === 'OWNER')) {
      throw new ForbiddenError('Admins can only manage regular members');
    }
    if (target.role === 'OWNER') throw new ForbiddenError('The server owner cannot be kicked or banned');
  }
}

export const memberService = new MemberService();