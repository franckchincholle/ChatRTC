import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class MemberController {
  /**
   * GET /servers/:serverId/members
   */
  async getServerMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { serverId } = req.params as { serverId: string };

      const members = await memberService.getServerMembers(userId, serverId);

      res.status(200).json({
        success: true,
        data: { members },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const memberController = new MemberController();