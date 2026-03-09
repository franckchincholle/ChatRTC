import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ServerService } from '../services/server.service';
import { ServerIdParams, ServerMemberParams } from "../types/server.types";
import { SocketManager } from '../sockets/socket.manager';


export class ServerController {
  private serverService: ServerService;

  constructor() {
    this.serverService = new ServerService();
  }

  createServer: RequestHandler = async (req, res, next) => {
    try {
      const server = await this.serverService.createServer(req.user.id, req.body);
      res.status(201).json({ success: true, data: server });
    } catch (error) { next(error); }
  };

  getUserServers: RequestHandler = async (req, res, next) => {
    try {
      const servers = await this.serverService.getUserServers(req.user.id);
      res.status(200).json({ success: true, data: servers });
    } catch (error) { next(error); }
  };

  getServerById: RequestHandler<ServerIdParams> = async (req, res, next) => {
    try {
      const server = await this.serverService.getServerById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: server });
    } catch (error) { next(error); }
  };

  updateServer: RequestHandler<ServerIdParams & ParamsDictionary> = async (req, res, next) => {
    try {
      const server = await this.serverService.updateServer(req.params.id, req.user.id, req.body);
      res.status(200).json({ success: true, data: server });
    } catch (error) { next(error); }
  };

  deleteServer: RequestHandler<ServerIdParams> = async (req, res, next) => {
    try {
      await this.serverService.deleteServer(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Server deleted' });
    } catch (error) { next(error); }
  };

  joinServerWithCode: RequestHandler = async (req, res, next) => {
    try {
      const member = await this.serverService.joinServer(req.body.inviteCode, req.user.id);
      res.status(200).json({ success: true, data: member });
    } catch (error) { next(error); }
  };

  leaveServer: RequestHandler<ServerIdParams> = async (req, res, next) => {
    try {
      const member = await this.serverService.leaveServer(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: member });
    } catch (error) { next(error); }
  };

  updateMemberRole: RequestHandler<ServerMemberParams & ParamsDictionary> = async (req, res, next) => {
    try {
      const { id: serverId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const updatedMember = await this.serverService.updateMemberRole(serverId, req.user.id, targetUserId, role);

      SocketManager.getIO()
      .to(`server:${serverId}`)
      .emit('member:role_updated', { 
        userId: targetUserId, 
        serverId, 
        role 
      });
      res.status(200).json({ success: true, data: updatedMember });
    } catch (error) { next(error); }
  };

  generateInviteCode: RequestHandler<ServerIdParams> = async (req, res, next) => {
    try {
      const code = await this.serverService.generatedInviteCode(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: { code } });
    } catch (error) { next(error); }
  };

  getServerMembers: RequestHandler<ServerIdParams> = async (req, res, next) => {
    try {
      const members = await this.serverService.getServerMembers(req.params.id);
      res.status(200).json({ success: true, data: members });
    } catch (error) { next(error); }
  };
}