import { Server, ServerMember, CreateServerDTO } from '../types/server.types';

export class ServerRepository {

  async create(data: CreateServerDTO & { ownerId: string}): Promise<Server> {
    const newServer = await this.db.server.save({
      name: data.name,
      ownerId: data.ownerId,
      // inviteCode: this.generateInviteCode(),
    })

    // await this.addMember(newServer.id, data.ownerId, 'owner');

    // async findById(id: string): Promise<Server | null> {
    //   // Implement logic find server by id
    //   throw new Error('Method not implemented.');
    // }

    return newServer;
  }



  // TODO: CRUD operations
  // - create(data)
  // - findById(id)
  // - findByUserId(userId)
  // - update(id, data)
  // - delete(id)
  // - addMember(serverId, userId, role)
  // - removeMember(serverId, userId)
  // - updateMemberRole(serverId, userId, role)
}