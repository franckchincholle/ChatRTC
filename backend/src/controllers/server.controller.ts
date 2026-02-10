import { Request, Response, NextFunction } from 'express';
import { ServerService } from '../services/server.service';
import { ServerIdParams, ServerMemberParams } from "../types/server.types";
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class ServerController {
  private serverService: ServerService;

  constructor() {
    this.serverService = new ServerService();
  }

  // POST /servers
  createServer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const server = await this.serverService.createServer(req.user.id, req.body);
      res.status(201).json({ success: true, data: server });
    } catch (error) {
      next(error);
    }
  };

  // GET /servers
  getUserServers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const servers = await this.serverService.getUserServers(req.user.id);
      res.status(200).json({ success: true, data: servers });
    } catch (error) {
      next(error);
    }
  };

  // GET /servers/:id
  getServerById = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const server = await this.serverService.getServerById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: server });
    } catch (error) {
      next(error);
    }
  };

  // PUT /servers/:id
  updateServer = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const server = await this.serverService.updateServer(req.params.id, req.user.id, req.body);
      res.status(200).json({ success: true, data: server });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /servers/:id
  deleteServer = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.serverService.deleteServer(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Server deleted' });
    } catch (error) {
      next(error);
    }
  };

  // POST /servers/join
  joinServerWithCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const member = await this.serverService.joinServer(req.user.id, req.body.inviteCode);
      res.status(200).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /servers/:id/leave
  leaveServer = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const member = await this.serverService.leaveServer(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  };

  // PUT /servers/:id/members/:userId
  updateMemberRole = async (req: AuthenticatedRequest<ServerMemberParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: serverId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const adminId = req.user.id;
      const updatedMember = await this.serverService.updateMemberRole(serverId, adminId, targetUserId, role);
      res.status(200).json({ success: true, data: updatedMember });
    } catch (error) {
      next(error);
    }
  };

  // POST /servers/:id/invite
  generateInviteCode = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const serverId = req.params.id;
      const userId = req.user.id;
      const code = await this.serverService.generatedInviteCode(serverId, userId);
      res.status(200).json({ success: true, data: { code } });
    } catch (error) {
      next(error);
    }
  }

  // GET /servers/:id/members
  getServerMembers = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await this.serverService.getServerMembers(req.params.id);
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  };
}
