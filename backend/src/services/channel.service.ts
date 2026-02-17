import { channelRepository } from '../repositories/channel.repository';
import { serverMemberRepository } from '../repositories/server-member.repository';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { CreateChannelData, UpdateChannelData, ChannelResponse } from '../types/channel.types';
import { SocketManager } from '../sockets/socket.manager';

export class ChannelService {

  private async checkAdminOrOwnerPermission(userId: string, serverId: string): Promise<void> {
    const isAdminOrOwner = await serverMemberRepository.isAdminOrOwner(userId, serverId);

    if (!isAdminOrOwner) {
      throw new ForbiddenError('Vous n\'avez pas les permissions pour effectuer cette action');
    }
  }

  private async checkMemberPermission(userId: string, serverId: string): Promise<void> {
    const isMember = await serverMemberRepository.isMember(userId, serverId);

    if (!isMember) {
      throw new ForbiddenError('Vous n\'êtes pas membre de ce serveur');
    }
  }

  async createChannel(userId: string, data: CreateChannelData): Promise<ChannelResponse> {

    await this.checkAdminOrOwnerPermission(userId, data.serverId);


    try {
      const channel = await channelRepository.createChannel({
        name: data.name,
        serverId: data.serverId,
      });

      const response = {
        id: channel.id,
        name: channel.name,
        serverId: channel.serverId,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      };

      SocketManager.getIO().to(`server:${channel.serverId}`).emit('channel:created', response);

      return response;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestError('Un channel avec ce nom existe déjà dans ce serveur');
      }
      throw error;
    }
  }

  async getChannelsByServerId(userId: string, serverId: string): Promise<ChannelResponse[]> {

    await this.checkMemberPermission(userId, serverId);

    const channels = await channelRepository.findByServerId(serverId);

    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    }));
  }

  async getChannelById(userId: string, channelId: string): Promise<ChannelResponse> {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    await this.checkMemberPermission(userId, channel.serverId);

    return {
      id: channel.id,
      name: channel.name,
      serverId: channel.serverId,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  }

  async updateChannel(
    userId: string,
    channelId: string,
    data: UpdateChannelData
  ): Promise<ChannelResponse> {
    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    await this.checkAdminOrOwnerPermission(userId, channel.serverId);

    try {
      const updatedChannel = await channelRepository.updateChannel(channelId, {
        name: data.name,
      });

      const response = {
        id: updatedChannel.id,
        name: updatedChannel.name,
        serverId: updatedChannel.serverId,
        createdAt: updatedChannel.createdAt,
        updatedAt: updatedChannel.updatedAt,
      };

      SocketManager.getIO().to(`server:${updatedChannel.serverId}`).emit('channel:updated', response);

      return response;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestError('Un channel avec ce nom existe déjà dans ce serveur');
      }
      throw error;
    }
  }

  async deleteChannel(userId: string, channelId: string): Promise<void> {

    const channel = await channelRepository.findById(channelId);

    if (!channel) {
      throw new NotFoundError('Channel introuvable');
    }

    await this.checkAdminOrOwnerPermission(userId, channel.serverId);

    await channelRepository.deleteChannel(channelId);

    SocketManager.getIO().to(`server:${channel.serverId}`).emit('channel:deleted', { channelId, serverId: channel.serverId });
  }
}

export const channelService = new ChannelService();