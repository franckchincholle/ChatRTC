import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import type { BanDuration } from '../types/member.types';

export class MemberController {

  async getServerMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { serverId } = req.params as { serverId: string };

      const members = await memberService.getServerMembers(userId, serverId);

      res.status(200).json({ success: true, data: { members } });
    } catch (error) {
      next(error);
    }
  }

  async kickMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = (req as AuthenticatedRequest).user.id;
      const { serverId, userId } = req.params as { serverId: string; userId: string };

      await memberService.kickMember(requesterId, serverId, userId);

      res.status(200).json({ success: true, message: 'Member kicked successfully' });
    } catch (error) {
      next(error);
    }
  }

  async banMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = (req as AuthenticatedRequest).user.id;
      const { serverId, userId } = req.params as { serverId: string; userId: string };
      const { duration } = req.body as { duration: BanDuration };

      await memberService.banMember(requesterId, serverId, userId, duration);

      res.status(200).json({ success: true, message: 'Member banned successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unbanMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requesterId = (req as AuthenticatedRequest).user.id;
      const { serverId, userId } = req.params as { serverId: string; userId: string };

      await memberService.unbanMember(requesterId, serverId, userId);

      res.status(200).json({ success: true, message: 'Member unbanned successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const memberController = new MemberController();