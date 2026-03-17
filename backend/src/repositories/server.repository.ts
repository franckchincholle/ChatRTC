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
      data: {
        name: data.name,
      }
    });
  }

  async delete(id: string): Promise<Server> {
    return await prisma.server.delete({
      where: {
        id
      },
    });
  }

  async findInvitationByCode(code: string) {
    return await prisma.invitation.findUnique({
      where: {
        code
      }
    });
  }

  async createInvitation(serverId: string, code: string, expiresAt?: Date) {
    return await prisma.invitation.create({
      data: {
        code,
        serverId,
        expiresAt,
      }
    })
  }

  async deleteInvitation(code: string) {
    return await prisma.invitation.delete({
      where: { code }
    });
  }

  async transferOwnership(serverId: string, oldOwnerId: string, newOwnerId: string): Promise<void> {
    await prisma.$transaction([
      prisma.server.update({
        where: {
          id: serverId
        },
        data: {
          ownerId: newOwnerId
        },
      }),
      prisma.serverMember.update({
        where: {
          userId_serverId: {
            userId: oldOwnerId,
            serverId
          },
        },
        data: {
          role: 'MEMBER'
        }
      }),
      prisma.serverMember.update({
        where: {
          userId_serverId: {
            userId: newOwnerId,
            serverId
          },
        },
        data: {
          role: 'OWNER'
        },
      })
    ]);
  }
}