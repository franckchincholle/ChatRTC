import { prisma } from '../config/database';
import { ServerMember } from '@prisma/client';

/**
 * Repository pour les opérations sur les ServerMember
 */
export class ServerMemberRepository {
  /**
   * Trouver un membre par userId et serverId
   */
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

  /**
   * Vérifier si un utilisateur est Admin ou Owner d'un serveur
   */
  async isAdminOrOwner(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null && (member.role === 'ADMIN' || member.role === 'OWNER');
  }

  /**
   * Vérifier si un utilisateur est Owner d'un serveur
   */
  async isOwner(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null && member.role === 'OWNER';
  }

  /**
   * Vérifier si un utilisateur est membre d'un serveur (peu importe le rôle)
   */
  async isMember(userId: string, serverId: string): Promise<boolean> {
    const member = await this.findByUserAndServer(userId, serverId);
    return member !== null;
  }

  /**
   * Récupérer tous les membres d'un serveur
   */
  async findByServerId(serverId: string): Promise<ServerMember[]> {
    return prisma.serverMember.findMany({
      where: { serverId },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * Ajouter un membre à un serveur
   */
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

  /**
   * Mettre à jour le rôle d'un membre
   */
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

  /**
   * Retirer un membre d'un serveur
   */
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

  /**
   * Compter le nombre de membres dans un serveur
   */
  async countByServerId(serverId: string): Promise<number> {
    return prisma.serverMember.count({
      where: { serverId },
    });
  }
}

// Export d'une instance singleton
export const serverMemberRepository = new ServerMemberRepository();