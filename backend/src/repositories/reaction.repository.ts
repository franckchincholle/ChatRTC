import { prisma } from '../config/database';
import { Reaction } from '@prisma/client';

export class ReactionRepository {

  async findByUserAndMessage(userId: string, messageId: string): Promise<Reaction | null> {
    return prisma.reaction.findUnique({
      where: { messageId_userId: { messageId, userId } },
    });
  }

  async findByMessageId(messageId: string): Promise<Reaction[]> {
    return prisma.reaction.findMany({
      where: { messageId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsert(userId: string, messageId: string, emoji: string): Promise<Reaction> {
    return prisma.reaction.upsert({
      where:  { messageId_userId: { messageId, userId } },
      update: { emoji },
      create: { userId, messageId, emoji },
    });
  }

  async delete(userId: string, messageId: string): Promise<void> {
    await prisma.reaction.delete({
      where: { messageId_userId: { messageId, userId } },
    }).catch(() => {
      // Ignore si déjà supprimée
    });
  }
}

export const reactionRepository = new ReactionRepository();