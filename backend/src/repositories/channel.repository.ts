import { prisma } from '../config/database';
import { Channel } from '@prisma/client';
import type { CreateChannelData, UpdateChannelInput } from '../types/channel.types';

/**
 * Repository pour les opérations sur les channels
 */
export class ChannelRepository {
  /**
   * Créer un nouveau channel
   */
  async createChannel(data: CreateChannelData): Promise<Channel> {
    return prisma.channel.create({
      data: {
        name: data.name,
        serverId: data.serverId,
      },
    });
  }

  /**
   * Trouver un channel par ID
   */
  async findById(id: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { id },
      include: {
        server: true,
      },
    });
  }

  /**
   * Trouver tous les channels d'un serveur
   */
  async findByServerId(serverId: string): Promise<Channel[]> {
    return prisma.channel.findMany({
      where: { serverId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Vérifier si un channel existe dans un serveur avec ce nom
   */
  async existsInServer(serverId: string, name: string): Promise<boolean> {
    const channel = await prisma.channel.findUnique({
      where: {
        serverId_name: {
          serverId,
          name,
        },
      },
    });
    return channel !== null;
  }

  /**
   * Mettre à jour un channel
   */
  async updateChannel(id: string, data: UpdateChannelInput): Promise<Channel> {
    return prisma.channel.update({
      where: { id },
      data,
    });
  }

  /**
   * Supprimer un channel
   */
  async deleteChannel(id: string): Promise<Channel> {
    return prisma.channel.delete({
      where: { id },
    });
  }

  /**
   * Compter le nombre de channels dans un serveur
   */
  async countByServerId(serverId: string): Promise<number> {
    return prisma.channel.count({
      where: { serverId },
    });
  }
}

// Export d'une instance singleton
export const channelRepository = new ChannelRepository();