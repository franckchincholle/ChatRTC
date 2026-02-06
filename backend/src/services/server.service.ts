import { ServerRepository } from "../repositories/server.repository";
import { CreateServerDTO, Server, ServerMember, UpdateServerDTO } from "../types/server.types";

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

}

// TODO: Business logic
// - getServerById(serverId, userId)
// - getUserServers(userId)
// - updateServer(serverId, userId, data)
// - deleteServer(serverId, userId)
// - joinServer(inviteCode, userId)
// - generateInviteCode(serverId, userId)
// - getServerMembers(serverId)
// - updateMemberRole(serverId, ownerId, targetUserId, role)
// - transferOwnership(serverId, ownerId, newOwnerId)