import { Request, Response, NextFunction } from 'express';
import { channelService } from '../services/channel.service';
import type { CreateChannelData, UpdateChannelData } from '../types/channel.types';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SocketManager } from '../sockets/socket.manager';

export class ChannelController {

  async createChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { serverId } = req.params as { serverId: string };

      const channelData: CreateChannelData = {
        name: req.body.name,
        serverId,
      };

      const channel = await channelService.createChannel(userId, channelData);

      // ✅ Émettre à tous les membres du serveur
      SocketManager.getIO()
        .to(`server:${serverId}`)
        .emit('channel:created', channel);

      res.status(201).json({
        success: true,
        message: 'Channel créé avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChannelsByServer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { serverId } = req.params as { serverId: string };
      const channels = await channelService.getChannelsByServerId(userId, serverId);
      res.status(200).json({
        success: true,
        message: 'Channels récupérés avec succès',
        data: { channels },
      });
    } catch (error) {
      next(error);
    }
  }

  async getChannelById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params as { id: string };
      const channel = await channelService.getChannelById(userId, id);
      res.status(200).json({
        success: true,
        message: 'Channel récupéré avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params as { id: string };

      const updateData: UpdateChannelData = {
        name: req.body.name,
      };

      const channel = await channelService.updateChannel(userId, id, updateData);

      // ✅ Émettre à tous les membres du serveur
      SocketManager.getIO()
        .to(`server:${channel.serverId}`)
        .emit('channel:updated', channel);

      res.status(200).json({
        success: true,
        message: 'Channel mis à jour avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { id } = req.params as { id: string };

      // Récupérer le channel AVANT de le supprimer pour avoir le serverId
      const channel = await channelService.getChannelById(userId, id);

      await channelService.deleteChannel(userId, id);

      // ✅ Émettre à tous les membres du serveur
      SocketManager.getIO()
        .to(`server:${channel.serverId}`)
        .emit('channel:deleted', { 
          channelId: id, 
          serverId: channel.serverId 
        });

      res.status(200).json({
        success: true,
        message: 'Channel supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const channelController = new ChannelController();