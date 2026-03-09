import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { userRepository } from '../repositories/user.repository';

export interface AuthenticatedRequest<P = ParamsDictionary> extends Request<P> {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Token manquant');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Format de token invalide');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('Utilisateur introuvable');
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};