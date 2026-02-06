import { prisma } from '../config/database';
import { Server, ServerMember, CreateServerDTO } from '../types/server.types';

export class ServerRepository {
  async create(data: CreateServerDTO & { ownerId: string }): Promise<Server> {
    return await prisma.$transaction(async (tx) => {
      const newServer = await tx.server.create({
        data: {
          name: data.name,
          ownerId: data.ownerId,
        },
      });
      await tx.serverMember.create({
        data: {
          serverId: newServer.id,
          userId: data.ownerId,
          role: 'OWNER',
        },
      });
      return newServer;
    });
  }

  async findById(id: string): Promise<Server | null> {
    return await prisma.server.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: string): Promise<Server[]> {
    return await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }
}
  // TODO: CRUD operations
  // - update(id, data)
  // - delete(id)
  // - addMember(serverId, userId, role)
  // - removeMember(serverId, userId)
  // - updateMemberRole(serverId, userId, role)
