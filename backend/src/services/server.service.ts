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
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error('Server not found');
    }
    if (server.ownerId !== userId) {
      throw new Error('Only the server owner can generate invite codes');
    }
    const code = randomBytes(4).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await this.serverRepository.createInvitation(serverId, code, expiresAt);
    return code;
  }
}

// TODO: Business logic
// - getServerById(serverId, userId)
// - getUserServers(userId)
// - updateServer(serverId, userId, data)
// - deleteServer(serverId, userId)
// - generateInviteCode(serverId, userId)
// - getServerMembers(serverId)
// - updateMemberRole(serverId, ownerId, targetUserId, role)
// - transferOwnership(serverId, ownerId, newOwnerId)