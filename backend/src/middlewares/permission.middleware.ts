// Middleware pour vérifier les permissions (rôles)

import { Request, Response, NextFunction } from 'express';

// TODO: Permission checks
// - isOwner(serverId)
// - isAdmin(serverId)
// - isMember(serverId)
// - canManageChannels(serverId)
// - canManageMembers(serverId)

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Vérifier si l'user est owner du serveur
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Vérifier si l'user est admin ou owner
};

export const requireMember = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Vérifier si l'user est membre du serveur
};