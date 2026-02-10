import { Request, Response, NextFunction } from 'express';
import { channelService } from '../services/channel.service';
import type { CreateChannelData, UpdateChannelData } from '../types/channel.types';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * Controller gérant les routes des channels
 */
export class ChannelController {
  /**
   * Créer un nouveau channel
   * @route POST /servers/:serverId/channels
   */
  async createChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Récupérer l'utilisateur connecté (ajouté par le middleware auth)
      const userId = (req as AuthenticatedRequest).user.id;

      // 2. Récupérer le serverId depuis l'URL
      const { serverId } = req.params;

      // 3. Récupérer les données du body (déjà validées)
      const channelData: CreateChannelData = {
        name: req.body.name,
        serverId,
      };

      // 4. Appeler le service
      const channel = await channelService.createChannel(userId, channelData);

      // 5. Retourner la réponse
      res.status(201).json({
        success: true,
        message: 'Channel créé avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer tous les channels d'un serveur
   * @route GET /servers/:serverId/channels
   */
  async getChannelsByServer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Récupérer l'utilisateur connecté
      const userId = (req as AuthenticatedRequest).user.id;

      // 2. Récupérer le serverId depuis l'URL
      const { serverId } = req.params;

      // 3. Appeler le service
      const channels = await channelService.getChannelsByServerId(userId, serverId);

      // 4. Retourner la liste
      res.status(200).json({
        success: true,
        message: 'Channels récupérés avec succès',
        data: { channels },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer un channel par son ID
   * @route GET /channels/:id
   */
  async getChannelById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Récupérer l'utilisateur connecté
      const userId = (req as AuthenticatedRequest).user.id;

      // 2. Récupérer l'ID du channel depuis l'URL
      const { id } = req.params;

      // 3. Appeler le service
      const channel = await channelService.getChannelById(userId, id);

      // 4. Retourner le channel
      res.status(200).json({
        success: true,
        message: 'Channel récupéré avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour un channel
   * @route PUT /channels/:id
   */
  async updateChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Récupérer l'utilisateur connecté
      const userId = (req as AuthenticatedRequest).user.id;

      // 2. Récupérer l'ID du channel depuis l'URL
      const { id } = req.params;

      // 3. Récupérer les données du body (déjà validées)
      const updateData: UpdateChannelData = {
        name: req.body.name,
      };

      // 4. Appeler le service
      const channel = await channelService.updateChannel(userId, id, updateData);

      // 5. Retourner le channel mis à jour
      res.status(200).json({
        success: true,
        message: 'Channel mis à jour avec succès',
        data: { channel },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer un channel
   * @route DELETE /channels/:id
   */
  async deleteChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Récupérer l'utilisateur connecté
      const userId = (req as AuthenticatedRequest).user.id;

      // 2. Récupérer l'ID du channel depuis l'URL
      const { id } = req.params;

      // 3. Appeler le service
      await channelService.deleteChannel(userId, id);

      // 4. Retourner une confirmation
      res.status(200).json({
        success: true,
        message: 'Channel supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Instance unique du controller de channels
 */
export const channelController = new ChannelController();