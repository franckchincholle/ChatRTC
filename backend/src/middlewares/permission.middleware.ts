import { Response, NextFunction } from 'express';
import { serverMemberRepository } from '../repositories/server-member.repository';
import { ServerIdParams } from "../types/server.types";
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';


export const requireOwner = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const serverId = req.params.id;
    const userId = req.user.id;

    const isOwner = await serverMemberRepository.isOwner(userId, serverId);

    if (!isOwner) {
      throw new ForbiddenError("Only the server owner can perform this action");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const serverId = req.params.id;
    const userId = req.user.id;

    const hasPrivileges = await serverMemberRepository.isAdminOrOwner(userId, serverId);

    if (!hasPrivileges) {
      throw new ForbiddenError("Admin or owner privileges required to perform this action");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireMember = async (req: AuthenticatedRequest<ServerIdParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const serverId = req.params.id;
    const userId = req.user.id;

    const isMember = await serverMemberRepository.isMember(userId, serverId);

    if (!isMember) {
      throw new ForbiddenError("Access denied: You must be a member of this server to perform this action");
    }

    next();
  } catch (error) {
    next(error);
  }
};