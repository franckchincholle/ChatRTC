import { ServerRepository } from "../repositories/server.repository";
import { CreateServerDTO, Server, ServerMember, UpdateServerDTO } from "../types/server.types";
import { randomBytes } from "crypto";

export class ServerService {
  private serverRepository: ServerRepository;

  constructor() {
    this.serverRepository = new ServerRepository();
  }

  async createServer(ownerId: string, data: CreateServerDTO): Promise<Server> {
    return await this.serverRepository.create(data, ownerId);
  }

  async leaveServer(serverId: string, userId: string): Promise<ServerMember> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    if (server.ownerId === userId) {
      throw new Error('Owner cannot leave the server. Transfer ownership or delete the server.');
    }

    return await this.serverRepository.removeMember(serverId, userId);
  }

  async joinServer(inviteCode: string, userId: string): Promise<ServerMember> {
    const invitation = await this.serverRepository.findInvitationByCode(inviteCode);
    if (!invitation) {
      throw new Error('Invalid invite code');
    }
    /* if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        throw new Error("Invitation code has expired");
    } */
    return await this.serverRepository.addMember(invitation.serverId, userId, 'MEMBER');
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
      throw new Error('Server not found');
    }
    return server;
  }

  async getServerMembers(serverId: string): Promise<ServerMember[]> {
    return await this.serverRepository.findAllMembersByServerId(serverId);
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
      throw new Error('Server not found');
    }
    if (server.ownerId !== userId) {
      throw new Error('Only the server owner can update server details');
    }
    return await this.serverRepository.update(serverId, data);
  }
}

// TODO: Business logic
// - deleteServer(serverId, userId)