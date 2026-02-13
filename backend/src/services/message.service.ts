import { messageRepository } from '../repositories/message.repository';
import { channelRepository } from '../repositories/channel.repository';
import { ServerMemberRepository, serverMemberRepository } from '../repositories/server-member.repository';
import { SocketManager } from '../sockets/socket.manager';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export class MessageService {
    async sendMessage(userId: string, channelId: string, content: string) {
        // Check if channel exists
        const channel = await channelRepository.findById(channelId);
        if (!channel) {
            throw new NotFoundError('Channel not found');
        }

        // Check if user is a member of the server
        const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
        if (!isMember) {
            throw new ForbiddenError('You are not a member of this server');
        }

        // Save message to database
        const newMessage = await messageRepository.create({ content, channelId, userId });

        // Emit message to channel members
        SocketManager.getIO().to(`server:${channel.serverId}`).emit('message:received', newMessage);

        return newMessage;
    }

    async getChannelMessages(userId: string, channelId: string) {
        const channel = await channelRepository.findById(channelId);
        if (!channel) {
            throw new ForbiddenError('Channel not found');
        }
        const isMember = await serverMemberRepository.isMember(userId, channel.serverId);
        if (!isMember) {
            throw new ForbiddenError('You are not a member of this server');
        }
        return messageRepository.findByChannelId(channelId);
    }

    async deleteMessage(userId: string, messageId: string) {
        // 1. Check if message exists
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw new NotFoundError('Message not found');
        }

        // 2. Check channel information
        const channel = await channelRepository.findById(message.channelId);
        if (!channel) {
            throw new NotFoundError('Channel not found');
        }

        // 3. Find requester role
        const requesterMember = await serverMemberRepository.findByUserAndServer(userId, channel.serverId);

        // 4. Find author role
        const authorMember = await serverMemberRepository.findByUserAndServer(message.userId, channel.serverId);

        const isAuthor = message.userId === userId;
        const requesterRole = requesterMember?.role;
        const authorRole = authorMember?.role;

        // 5. Permission Logics
        let canDelete = false;
        if (isAuthor) {
            canDelete = true;
        } else if (requesterRole === 'OWNER') {
            canDelete = true;
        } else if (requesterRole === 'ADMIN' && authorRole === 'MEMBER') {
            canDelete = true;
        }
        if (!canDelete) {
            throw new ForbiddenError('You do not have permission to delete this message');
        }

        // 6. Delete message
        await messageRepository.delete(messageId);

        // 7. Emit deletion event
        SocketManager.getIO().to(`server:${channel.serverId}`).emit('message:deleted', { messageId, channelId: message.channelId });

        return { success: true};
    }
}

export const messageService = new MessageService();