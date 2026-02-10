import { ServerRepository } from "../repositories/server.repository";
import { serverMemberRepository } from '../repositories/server-member.repository';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { CreateServerDTO, Server, ServerMember, UpdateServerDTO } from "../types/server.types";
import { randomBytes } from "crypto";

export class ServerService {
  private serverRepository: ServerRepository;

  constructor() {
    this.serverRepository = new ServerRepository();
  }

  async createServer(ownerId: string, data: CreateServerDTO): Promise<Server> {
    const server = await this.serverRepository.create(data, ownerId);
    await serverMemberRepository.addMember(ownerId, server.id, 'OWNER');
    return server;
  }

  async leaveServer(serverId: string, userId: string): Promise<ServerMember> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundError('Server not found');
    }

    if (server.ownerId === userId) {
      throw new Error('Owner cannot leave the server. Transfer ownership or delete the server.');
    }

    return await serverMemberRepository.removeMember(serverId, userId);
  }

  async joinServer(inviteCode: string, userId: string): Promise<ServerMember> {
    const invitation = await this.serverRepository.findInvitationByCode(inviteCode);
    if (!invitation) {
      throw new BadRequestError('Invalid invite code');
    }
    /* if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        throw new Error("Invitation code has expired");
    } */
    return await serverMemberRepository.addMember(userId, invitation.serverId, 'MEMBER');
  }

  async generatedInviteCode(serverId: string, userId: string): Promise<string> {
    const member = await this.serverRepository.findMember(serverId, userId);
    if (!member) {
      throw new Error('You are not a member of this server');
    }
    const authorizedRoles = ['OWNER', 'ADMIN'];
    if (!authorizedRoles.includes(member.role)) {
      throw new Error('You do not have permission to generate invite codes');
    }
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
    const member = await this.serverRepository.findMember(serverId, userId);
    if (!member) {
      throw new Error('You are not a member of this server');
    }
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundError('Server not found');
    }
    return server;
  }

  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    return await serverMemberRepository.findByServerId(serverId);
  }

  async transferOwnership(serverId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error('Server not found');
    }
    if (server.ownerId !== currentOwnerId) {
      throw new Error('Only the current owner can transfer ownership');
    }
    const newOwnerMember = await this.serverRepository.findMember(serverId, newOwnerId);
    if (!newOwnerMember) {
      throw new Error('New owner must be on the server');
    }
    return await this.serverRepository.transferOwnership(serverId, currentOwnerId, newOwnerId);
  }

  async updateMemberRole(serverId: string, adminId: string, targetUserId: string, role: 'ADMIN' | 'MEMBER'): Promise<ServerMember> {
    const requester = await this.serverRepository.findMember(serverId, adminId);
    if (!requester || (requester.role !== 'OWNER' && requester.role !== 'ADMIN')) {
      throw new Error('You do not have permission to update member roles');
    }
    const targetMember = await this.serverRepository.findMember(serverId, targetUserId);
    if (!targetMember) {
      throw new Error('Target user is not on the server');
    }
    if (targetMember.role === 'OWNER') {
      throw new Error('Cannot change role of the server owner');
    }
    if (requester.role === 'ADMIN' && targetMember.role === 'ADMIN') {
      throw new Error('Admins cannot change roles of other admins');
    }
    return await this.serverRepository.updateMemberRole(serverId, targetUserId, role);
  }

  async updateServer(serverId: string, userId: string, data: UpdateServerDTO): Promise<Server> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundError('Server not found');
    }
    if (server.ownerId !== userId) {
      throw new Error('Only the server owner can update server details');
    }
    return await this.serverRepository.update(serverId, data);
  }

  async deleteServer(serverId: string, userId: string): Promise<Server> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new NotFoundError('Server not found');
    }
    if (server.ownerId !== userId) {
      throw new Error('Only the server owner can delete the server');
    }
    return await this.serverRepository.delete(serverId);
  }
}