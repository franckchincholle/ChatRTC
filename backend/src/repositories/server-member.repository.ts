import { prisma } from '../config/database';
import { ServerMember, User } from '@prisma/client';

export type ServerMemberWithUser = ServerMember & {
  user: Pick<User, 'id' | 'username' | 'email'>;
};


export class ServerMemberRepository {

  async findByUserAndServer(
    userId: string,
    serverId: string
  ): Promise<ServerMember | null> {
    return prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });
  }

  async isAdminOrOwner(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null && (member.role === 'ADMIN' || member.role === 'OWNER');
  }

  async isOwner(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null && member.role === 'OWNER';
  }

  async isMember(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null;
  }

  async findByServerId(serverId: string): Promise<ServerMemberWithUser[]> {
    return prisma.serverMember.findMany({
      where: { serverId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    }) as unknown as ServerMemberWithUser[];  
  }

  async addMember(
    userId: string,
    serverId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'
  ): Promise<ServerMember> {
    return prisma.serverMember.create({
      data: {
        userId,
        serverId,
        role,
      },
    });
  }

  async updateRole(
    userId: string,
    serverId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
  ): Promise<ServerMember> {
    return prisma.serverMember.update({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
      data: { role },
    });
  }

  async removeMember(userId: string, serverId: string): Promise<ServerMember> {
    return prisma.serverMember.delete({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });
  }

  async countByServerId(serverId: string): Promise<number> {
    return prisma.serverMember.count({
      where: { serverId },
    });
  }
}

export const serverMemberRepository = new ServerMemberRepository();