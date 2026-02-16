import { messageRepository, MessageWithAuthor } from '../repositories/message.repository';
import { channelRepository } from '../repositories/channel.repository';
import { serverMemberRepository } from '../repositories/server-member.repository';
import { SocketManager } from '../sockets/socket.manager';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class MessageService {
  async sendMessage(
    userId: string,
    channelId: string,
    content: string
  ): Promise<MessageWithAuthor> {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    const newMessage = await messageRepository.create({ content, channelId, userId });

    // Émettre le message à tous les membres du serveur
    SocketManager.getIO()
      .to(`server:${channel.serverId}`)
      .emit('message:received', newMessage);

    return newMessage;
  }

  async getChannelMessages(
    userId: string,
    channelId: string
  ): Promise<MessageWithAuthor[]> {
    const channel = await channelRepository.findById(channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
    if (!isMember) throw new ForbiddenError('You are not a member of this server');

    return messageRepository.findByChannelId(channelId);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new NotFoundError('Message not found');

    const channel = await channelRepository.findById(message.channelId);
    if (!channel) throw new NotFoundError('Channel not found');

    const requesterMember = await serverMemberRepository.findByUserAndServer(userId, channel.serverId);
    const authorMember = await serverMemberRepository.findByUserAndServer(message.userId, channel.serverId);

    const isAuthor = message.userId === userId;
    const requesterRole = requesterMember?.role;
    const authorRole = authorMember?.role;

    // Logique de permissions
    const canDelete =
      isAuthor ||
      requesterRole === 'OWNER' ||
      (requesterRole === 'ADMIN' && authorRole === 'MEMBER');

    if (!canDelete) {
      throw new ForbiddenError('You do not have permission to delete this message');
    }

    await messageRepository.delete(messageId);

    // Émettre l'événement de suppression
    SocketManager.getIO()
      .to(`server:${channel.serverId}`)
      .emit('message:deleted', { messageId, channelId: message.channelId });
  }
}

export const messageService = new MessageService();