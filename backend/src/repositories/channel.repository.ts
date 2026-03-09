import { prisma } from '../config/database';
import { Channel } from '@prisma/client';
import type { CreateChannelData, UpdateChannelInput } from '../types/channel.types';

export class ChannelRepository {

  async createChannel(data: CreateChannelData): Promise<Channel> {
    return prisma.channel.create({
      data: {
        name: data.name,
        serverId: data.serverId,
      },
    });
  }

  async findById(id: string): Promise<Channel | null> {
    return prisma.channel.findUnique({
      where: { id },
      include: {
        server: true,
      },
    });
  }

  async findByServerId(serverId: string): Promise<Channel[]> {
    return prisma.channel.findMany({
      where: { serverId },
      orderBy: { createdAt: 'asc' },
    });
  }

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

  async updateChannel(id: string, data: UpdateChannelInput): Promise<Channel> {
    return prisma.channel.update({
      where: { id },
      data,
    });
  }

  async deleteChannel(id: string): Promise<Channel> {
    return prisma.channel.delete({
      where: { id },
    });
  }

  async countByServerId(serverId: string): Promise<number> {
    return prisma.channel.count({
      where: { serverId },
    });
  }
}

export const channelRepository = new ChannelRepository();