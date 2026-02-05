import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Payload du token JWT
 */
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Génère un token JWT d'accès
 * @param payload - Données à inclure dans le token
 * @returns Token JWT signé
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Génère un token JWT de rafraîchissement
 * @param payload - Données à inclure dans le token
 * @returns Refresh token JWT signé
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Vérifie et décode un token JWT d'accès
 * @param token - Token à vérifier
 * @returns Payload décodé
 * @throws Si le token est invalide ou expiré
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

/**
 * Vérifie et décode un refresh token
 * @param token - Refresh token à vérifier
 * @returns Payload décodé
 * @throws Si le token est invalide ou expiré
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};