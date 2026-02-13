import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/message.service';

export class MessageController {
    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { channelId, content } = req.body;

            const message = await messageService.sendMessage(userId, channelId, content);

            res.status(201).json({ success: true, data: message });
        } catch (error) {
            next(error);
        }
    }

    async getMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { channelId } = req.params as { channelId: string };

            const messages = await messageService.getChannelMessages(userId, channelId);

            res.json({ success: true, data: messages });
        } catch (error) {
            next(error);
        }
    }
}

export const messageController = new MessageController();