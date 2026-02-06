import { prisma } from '../config/database';
import { Server, ServerMember, CreateServerDTO, UpdateServerDTO } from '../types/server.types';

export class ServerRepository {
  async create(data: CreateServerDTO, ownerId: string): Promise<Server> {
    return await prisma.$transaction(async (tx) => {
      const newServer = await tx.server.create({
        data: {
          name: data.name,
          ownerId: ownerId,
        },
      });
      await tx.serverMember.create({
        data: {
          serverId: newServer.id,
          userId: ownerId,
          role: 'OWNER',
        },
      });
      return newServer;
    });
  }

  async findById(id: string): Promise<Server | null> {
    return await prisma.server.findUnique({
      where: {
        id
      },
    });
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

  async update(id: string, data: UpdateServerDTO): Promise<Server> {
    return await prisma.server.update({
      where: {
        id
      },
      data,
    });
  }

  async delete(id: string): Promise<Server> {
    return await prisma.server.delete({
      where: {
        id
      },
    });
  }

  async addMember(serverId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<ServerMember> {
    const member = await prisma.serverMember.create({
      data: {
        serverId,
        userId,
        role
      },
    });
    return member as ServerMember;
  }

  async removeMember(serverId: string, userId: string): Promise<ServerMember> {
    const member = await prisma.serverMember.delete({
      where: {
        userId_serverId: {
          serverId,
          userId
        },
      },
    });
    return member as ServerMember;
  }

  async updateMemberRole(serverId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Promise<ServerMember> {
    const member = await prisma.serverMember.update({
      where: {
        userId_serverId: {
          serverId,
          userId
        },
      },
      data: {
        role
      },
    });
    return member as ServerMember;
  }
}