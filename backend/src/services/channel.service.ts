import { channelRepository } from '../repositories/channel.repository';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { CreateChannelData, UpdateChannelData, ChannelResponse } from '../types/channel.types';
import { prisma } from '../config/database';

/**
 * Service gérant les channels
 */
export class ChannelService {
  /**
   * Vérifier qu'un utilisateur a les permissions Admin ou Owner dans un serveur
   * @throws ForbiddenError si l'utilisateur n'a pas les permissions
   */
  private async checkAdminOrOwnerPermission(userId: string, serverId: string): Promise<void> {
    // Récupérer le membre du serveur
    const member = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });

    // Si l'utilisateur n'est pas membre du serveur
    if (!member) {
      throw new ForbiddenError('Vous n\'êtes pas membre de ce serveur');
    }

    // Si l'utilisateur n'est ni Admin ni Owner
    if (member.role !== 'ADMIN' && member.role !== 'OWNER') {
      throw new ForbiddenError('Vous n\'avez pas les permissions pour effectuer cette action');
    }
  }

  /**
   * Vérifier qu'un utilisateur est membre d'un serveur
   * @throws ForbiddenError si l'utilisateur n'est pas membre
   */
  private async checkMemberPermission(userId: string, serverId: string): Promise<void> {
    const member = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenError('Vous n\'êtes pas membre de ce serveur');
    }
  }

  /**
   * Créer un nouveau channel
   * @param userId - ID de l'utilisateur qui crée le channel
   * @param data - Données du channel
   * @returns Channel créé
   * @throws ForbiddenError si l'utilisateur n'a pas les permissions
   * @throws BadRequestError si le nom du channel existe déjà
   */
  async createChannel(userId: string, data: CreateChannelData): Promise<ChannelResponse> {
    // 1. Vérifier les permissions (Admin ou Owner)
    await this.checkAdminOrOwnerPermission(userId, data.serverId);

    // 2. Vérifier que le serveur existe
    const server = await prisma.server.findUnique({
      where: { id: data.serverId },
    });

    if (!server) {
      throw new NotFoundError('Serveur introuvable');
    }

    // 3. Vérifier qu'un channel avec ce nom n'existe pas déjà dans ce serveur
    const nameExists = await channelRepository.existsInServer(data.serverId, data.name);
    
    if (nameExists) {
      throw new BadRequestError('Un channel avec ce nom existe déjà dans ce serveur');
    }

    // 4. Créer le channel
    const channel = await channelRepository.createChannel({
      name: data.name,
      serverId: data.serverId,
    });

    // 5. Retourner la réponse
    return {
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  }

  /**
   * Récupérer tous les channels d'un serveur
   * @param userId - ID de l'utilisateur qui fait la requête
   * @param serverId - ID du serveur
   * @returns Liste des channels
   * @throws ForbiddenError si l'utilisateur n'est pas membre du serveur
   */
  async getChannelsByServerId(userId: string, serverId: string): Promise<ChannelResponse[]> {
    // 1. Vérifier que l'utilisateur est membre du serveur
    await this.checkMemberPermission(userId, serverId);

    // 2. Récupérer tous les channels du serveur
    const channels = await channelRepository.findByServerId(serverId);

    // 3. Retourner la liste
    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    }));
  }

  /**
   * Récupérer un channel par son ID
   * @param userId - ID de l'utilisateur qui fait la requête
   * @param channelId - ID du channel
   * @returns Infos du channel
   * @throws NotFoundError si le channel n'existe pas
   * @throws ForbiddenError si l'utilisateur n'est pas membre du serveur
   */
  async getChannelById(userId: string, channelId: string): Promise<ChannelResponse> {
    // 1. Récupérer le channel
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    // 2. Vérifier que l'utilisateur est membre du serveur parent
    await this.checkMemberPermission(userId, channel.serverId);

    // 3. Retourner le channel
    return {
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  }

  /**
   * Mettre à jour un channel
   * @param userId - ID de l'utilisateur qui fait la requête
   * @param channelId - ID du channel à modifier
   * @param data - Nouvelles données
   * @returns Channel mis à jour
   * @throws NotFoundError si le channel n'existe pas
   * @throws ForbiddenError si l'utilisateur n'a pas les permissions
   * @throws BadRequestError si le nouveau nom existe déjà
   */
  async updateChannel(
    userId: string,
    channelId: string,
    data: UpdateChannelData
  ): Promise<ChannelResponse> {
    // 1. Récupérer le channel
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    // 2. Vérifier les permissions (Admin ou Owner)
    await this.checkAdminOrOwnerPermission(userId, channel.serverId);

    // 3. Si on change le nom, vérifier qu'il n'existe pas déjà
    if (data.name && data.name !== channel.name) {
      const nameExists = await channelRepository.existsInServer(channel.serverId, data.name);
      
      if (nameExists) {
        throw new BadRequestError('Un channel avec ce nom existe déjà dans ce serveur');
      }
    }

    // 4. Mettre à jour le channel
    const updatedChannel = await channelRepository.updateChannel(channelId, {
      name: data.name,
    });

    // 5. Retourner le channel mis à jour
    return {
      id: updatedChannel.id,
      name: updatedChannel.name,
      serverId: updatedChannel.serverId,
      createdAt: updatedChannel.createdAt,
      updatedAt: updatedChannel.updatedAt,
    };
  }

  /**
   * Supprimer un channel
   * @param userId - ID de l'utilisateur qui fait la requête
   * @param channelId - ID du channel à supprimer
   * @throws NotFoundError si le channel n'existe pas
   * @throws ForbiddenError si l'utilisateur n'a pas les permissions
   */
  async deleteChannel(userId: string, channelId: string): Promise<void> {
    // 1. Récupérer le channel
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    // 2. Vérifier les permissions (Admin ou Owner)
    await this.checkAdminOrOwnerPermission(userId, channel.serverId);

    // 3. Supprimer le channel (Prisma supprimera aussi les messages grâce à onDelete: Cascade)
    await channelRepository.deleteChannel(channelId);
  }
}

// Export d'une instance singleton
export const channelService = new ChannelService();