import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
  /**
   * Envoyer un message dans un channel
   * POST /channels/:channelId/messages
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { channelId } = req.params as { channelId: string };  // ✅ channelId depuis l'URL
      const { content } = req.body;

      const message = await messageService.sendMessage(userId, channelId, content);

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les messages d'un channel
   * GET /channels/:channelId/messages
   */
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

  /**
   * Supprimer un message
   * DELETE /channels/:channelId/messages/:messageId
   */
  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const { messageId } = req.params as { messageId: string };

      await messageService.deleteMessage(userId, messageId);

      res.json({ success: true, message: 'Message supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();