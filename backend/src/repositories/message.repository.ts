import { prisma } from '../config/database';
import { Message } from '@prisma/client';

export class MessageRepository {
    async create(data: { content: string, channelId: string, userId: string }): Promise<Message> {
        return prisma.message.create({
            data,
            include: {
                author: {
                    select: { id: true, username: true }
                }
            }
        });
    }

    async findByChannelId(channelId: string, limit = 50): Promise<Message[]> {
        return prisma.message.findMany({
            where: { channelId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, username: true }
                }
            }
        });
    }

    async findById(id: string): Promise<Message | null> {
        return prisma.message.findUnique({
            where: { id },
        });
    }

    async delete(id: string): Promise<Message> {
        return prisma.message.delete({
            where: { id },
        });
    }
}

export const messageRepository = new MessageRepository();