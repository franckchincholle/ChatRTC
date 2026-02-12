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
}

export const messageController = new MessageController();