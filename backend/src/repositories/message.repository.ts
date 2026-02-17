import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export type MessageWithAuthor = Prisma.MessageGetPayload<{
  include: { author: { select: { id: true; username: true } } };
}>;

const messageInclude = {
  author: {
    select: { id: true, username: true },
  },
} satisfies Prisma.MessageInclude;

export class MessageRepository {
  async create(data: {
    content: string;
    channelId: string;
    userId: string;
  }): Promise<MessageWithAuthor> {
    return prisma.message.create({
      data,
      include: messageInclude,
    });
  }

  async findByChannelId(channelId: string, limit = 50): Promise<MessageWithAuthor[]> {
    return prisma.message.findMany({
      where: { channelId },
      take: limit,
      orderBy: { createdAt: 'asc' }, 
      include: messageInclude,
    });
  }

  async findById(id: string): Promise<MessageWithAuthor | null> {
    return prisma.message.findUnique({
      where: { id },
      include: messageInclude,
    });
  }

  async delete(id: string): Promise<MessageWithAuthor> {
    return prisma.message.delete({
      where: { id },
      include: messageInclude,
    });
  }
}

export const messageRepository = new MessageRepository();