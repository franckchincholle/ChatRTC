import { reactionRepository } from '../repositories/reaction.repository';
import { messageRepository } from '../repositories/message.repository';
import { channelRepository } from '../repositories/channel.repository';
import { serverMemberRepository } from '../repositories/server-member.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface ReactionResponse {
  messageId: string;
  userId:    string;
  emoji:     string;
}

export class ReactionService {

  async toggleReaction(
    userId: string,
    messageId: string,
    emoji: string
  ): Promise<{ action: 'added' | 'removed' | 'changed'; reaction: ReactionResponse }> {
    // Vérifier que le message existe et que l'utilisateur est membre du serveur
    const message = await messageRepository.findById(messageId);
    if (!message) throw new NotFoundError('Message not found');

    const channel = await channelRepository.findById(message.channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    const existing = await reactionRepository.findByUserAndMessage(userId, messageId);

    // Même emoji → retirer
    if (existing && existing.emoji === emoji) {
      await reactionRepository.delete(userId, messageId);
      return {
        action: 'removed',
        reaction: { messageId, userId, emoji },
      };
    }

    // Emoji différent ou pas de réaction → ajouter/remplacer
    const reaction = await reactionRepository.upsert(userId, messageId, emoji);
    return {
      action: existing ? 'changed' : 'added',
      reaction: { messageId: reaction.messageId, userId: reaction.userId, emoji: reaction.emoji },
    };
  }

  async getMessageReactions(messageId: string): Promise<ReactionResponse[]> {
    const reactions = await reactionRepository.findByMessageId(messageId);
    return reactions.map((r) => ({ messageId: r.messageId, userId: r.userId, emoji: r.emoji }));
  }
}

export const reactionService = new ReactionService();