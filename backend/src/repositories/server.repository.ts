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
          userId,
          serverId
        },
      },
    });
    return member as ServerMember;
  }

  async updateMemberRole(serverId: string, userId: string, role: 'ADMIN' | 'MEMBER'): Promise<ServerMember> {
    const member = await prisma.serverMember.update({
      where: {
        userId_serverId: {
          userId,
          serverId
        },
      },
      data: {
        role
      },
    });
    return member as ServerMember;
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

  async findMember(serverId: string, userId: string): Promise<ServerMember | null> {
    const member = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId
        },
      },
    });
    return member as ServerMember | null;
  }

  async findAllMembersByServerId(serverId: string): Promise<ServerMember[]> {
    const members = await prisma.serverMember.findMany({
      where: {
        serverId,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
    return members as ServerMember[];
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