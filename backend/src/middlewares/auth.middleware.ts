import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { userRepository } from '../repositories/user.repository';

/**
 * Interface pour étendre le type Request d'Express
 * Permet d'ajouter la propriété "user" à req
 */
export interface AuthenticatedRequest<P = ParamsDictionary> extends Request<P> {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur a un token valide
 * 
 * @throws UnauthorizedError si le token est manquant ou invalide
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // 2. Vérifier que le header existe
    if (!authHeader) {
      throw new UnauthorizedError('Token manquant');
    }

    // 3. Vérifier le format: "Bearer <token>"
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Format de token invalide');
    }

    // 4. Extraire le token (enlever "Bearer ")
    const token = authHeader.substring(7); // "Bearer " fait 7 caractères

    // 5. Vérifier et décoder le token JWT
    const payload = verifyAccessToken(token);

    // 6. Vérifier que l'utilisateur existe toujours en DB
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedError('Utilisateur introuvable');
    }

    // 7. Ajouter les infos user à la requête
    (req as AuthenticatedRequest).user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // 8. Passer au middleware/controller suivant
    next();
  } catch (error) {
    // Si le token est invalide, expiré, etc.
    next(error);
  }
};