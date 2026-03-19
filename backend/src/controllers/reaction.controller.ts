import { Request, Response, NextFunction } from 'express';
import { reactionService } from '../services/reaction.service';
import { SocketManager } from '../sockets/socket.manager';

export class ReactionController {

  async toggleReaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId    = req.user.id;
      const { channelId, messageId } = req.params as { channelId: string; messageId: string };
      const { emoji } = req.body as { emoji: string };

      const result = await reactionService.toggleReaction(userId, messageId, emoji);

      const event = result.action === 'removed' ? 'reaction:removed' : 'reaction:added';
      SocketManager.getIO()
        .to(`channel:${channelId}`)
        .emit(event, { ...result.reaction, channelId });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const reactionController = new ReactionController();