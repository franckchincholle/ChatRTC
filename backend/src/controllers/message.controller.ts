import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';
import { SocketManager } from '../sockets/socket.manager';

export class MessageController {

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { channelId } = req.params as { channelId: string };  // ✅ channelId depuis l'URL
      const { content } = req.body;

      const message = await messageService.sendMessage(userId, channelId, content);

    const io = SocketManager.getIO();
    const room = `channel:${channelId}`;
    const socketsInRoom = await io.in(room).fetchSockets();
    socketsInRoom.forEach(s => console.log(`  - Socket: ${s.id}`));

    io.to(room).emit('message:received', message);

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { channelId } = req.params as { channelId: string };  // ✅ channelId depuis l'URL

      const messages = await messageService.getChannelMessages(userId, channelId);

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { channelId, messageId } = req.params as { 
        messageId: string,
        channelId: string 
      };

      await messageService.deleteMessage(userId, messageId);

      SocketManager.getIO()
        .to(`channel:${channelId}`)
        .emit('message:deleted', { messageId, channelId });

      res.json({ success: true, message: 'Message supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();