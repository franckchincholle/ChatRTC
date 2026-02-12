import { messageRepository } from '../repositories/message.repository';
import { channelRepository } from '../repositories/channel.repository';
import { serverMemberRepository } from '../repositories/server-member.repository';
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
}