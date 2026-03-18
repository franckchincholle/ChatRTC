import { messageRepository, MessageWithAuthor } from '../repositories/message.repository';
import { channelRepository } from '../repositories/channel.repository';
import { serverMemberRepository } from '../repositories/server-member.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class MessageService {

  async sendMessage(userId: string, channelId: string, content: string): Promise<MessageWithAuthor> {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    return messageRepository.create({ content, channelId, userId });
  }

  async getChannelMessages(userId: string, channelId: string): Promise<MessageWithAuthor[]> {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    return messageRepository.findByChannelId(channelId);
  }

  async updateMessage(userId: string, messageId: string, content: string): Promise<MessageWithAuthor> {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new NotFoundError('Message not found');

    if (message.userId !== userId) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    return messageRepository.update(messageId, content);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new NotFoundError('Message not found');

    const channel = await channelRepository.findById(message.channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const requesterMember = await serverMemberRepository.findByUserAndServer(userId, channel.serverId);
    const authorMember    = await serverMemberRepository.findByUserAndServer(message.userId, channel.serverId);

    const isAuthor       = message.userId === userId;
    const requesterRole  = requesterMember?.role;
    const authorRole     = authorMember?.role;

    const canDelete =
      isAuthor ||
      requesterRole === 'OWNER' ||
      (requesterRole === 'ADMIN' && authorRole === 'MEMBER');

    if (!canDelete) throw new ForbiddenError('You do not have permission to delete this message');

    await messageRepository.delete(messageId);
  }
}

export const messageService = new MessageService();