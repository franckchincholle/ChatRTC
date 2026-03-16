import { ServerRepository } from "../repositories/server.repository";
import { serverMemberRepository } from '../repositories/server-member.repository';
import { serverBanRepository } from '../repositories/server-ban.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { CreateServerDTO, Server, ServerMember, UpdateServerDTO } from "../types/server.types";
import { randomBytes } from "crypto";
import { SocketManager } from "../sockets/socket.manager";

export class ServerService {
  private serverRepository: ServerRepository;

  constructor() {
    this.serverRepository = new ServerRepository();
  }

  async createServer(ownerId: string, data: CreateServerDTO): Promise<Server> {
    const server = await this.serverRepository.create(data, ownerId);
    return server;
  }

  async leaveServer(serverId: string, userId: string): Promise<ServerMember> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundError('Server not found');
    if (server.ownerId === userId) throw new ForbiddenError('Owner cannot leave the server. Transfer ownership or delete the server.');

    const removedMember = await serverMemberRepository.removeMember(userId, serverId);
    SocketManager.getIO().to(`server:${serverId}`).emit('server:member_left', { userId, serverId });
    return removedMember;
  }

  async joinServer(inviteCode: string, userId: string): Promise<ServerMember> {
    const invitation = await this.serverRepository.findInvitationByCode(inviteCode);
    if (!invitation) throw new BadRequestError('Invalid invite code');

    const isBanned = await serverBanRepository.isBanned(userId, invitation.serverId);
    if (isBanned) throw new ForbiddenError('You are banned from this server');

    const newMember = await serverMemberRepository.addMember(userId, invitation.serverId, 'MEMBER');
    SocketManager.getIO().to(`server:${invitation.serverId}`).emit('server:member_joined', { userId, serverId: invitation.serverId });
    return newMember;
  }

  async generatedInviteCode(serverId: string, userId: string): Promise<string> {
    const member = await serverMemberRepository.findByUserAndServer(userId, serverId);
    if (!member) throw new ForbiddenError('You are not a member of this server');
    const authorizedRoles = ['OWNER', 'ADMIN'];
    if (!authorizedRoles.includes(member.role)) throw new ForbiddenError('You do not have permission to generate invite codes');
    const code = randomBytes(4).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await this.serverRepository.createInvitation(serverId, code, expiresAt);
    return code;
  }

  async getUserServers(userId: string): Promise<Server[]> {
    return await this.serverRepository.findByUserId(userId);
  }

  async getServerById(serverId: string, userId: string): Promise<Server> {
    const member = await serverMemberRepository.findByUserAndServer(userId, serverId);
    if (!member) throw new ForbiddenError('You are not a member of this server');
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundError('Server not found');
    return server;
  }

  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    return await serverMemberRepository.findByServerId(serverId);
  }

  async transferOwnership(serverId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundError('Server not found');
    if (server.ownerId !== currentOwnerId) throw new ForbiddenError('Only the current owner can transfer ownership');
    const newOwnerMember = await serverMemberRepository.findByUserAndServer(newOwnerId, serverId);
    if (!newOwnerMember) throw new BadRequestError('New owner must be on the server');
    return await this.serverRepository.transferOwnership(serverId, currentOwnerId, newOwnerId);
  }

  async updateMemberRole(serverId: string, adminId: string, targetUserId: string, role: 'ADMIN' | 'MEMBER'): Promise<ServerMember> {
    const requester = await serverMemberRepository.findByUserAndServer(adminId, serverId);
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) throw new ForbiddenError('You do not have permission to update member roles');
    const targetMember = await serverMemberRepository.findByUserAndServer(targetUserId, serverId);
    if (!targetMember) throw new NotFoundError('Target user is not on the server');
    if (targetMember.role === 'OWNER') throw new ForbiddenError('Cannot change role of the server owner');
    if (requester.role === 'ADMIN' && targetMember.role === 'ADMIN') throw new ForbiddenError('Admins cannot change roles of other admins');
    return await serverMemberRepository.updateRole(targetUserId, serverId, role);
  }

  async updateServer(serverId: string, userId: string, data: UpdateServerDTO): Promise<Server> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundError('Server not found');
    if (server.ownerId !== userId) throw new ForbiddenError('Only the server owner can update server details');
    SocketManager.getIO().to(`server:${serverId}`).emit('server:updated', { id: serverId, name: data.name });
    return await this.serverRepository.update(serverId, data);
  }

  async deleteServer(serverId: string, userId: string): Promise<Server> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundError('Server not found');
    if (server.ownerId !== userId) throw new ForbiddenError('Only the server owner can delete the server');
    const deletedServer = await this.serverRepository.delete(serverId);
    SocketManager.getIO().to(`server:${serverId}`).emit('server:deleted', { serverId });
    return deletedServer;
  }
}