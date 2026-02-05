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
  const secret = env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign(
    payload,
    secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

/**
 * Génère un token JWT de rafraîchissement
 * @param payload - Données à inclure dans le token
 * @returns Refresh token JWT signé
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret = env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.sign(
    payload,
    secret,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
};

/**
 * Vérifie et décode un token JWT d'accès
 * @param token - Token à vérifier
 * @returns Payload décodé
 * @throws Si le token est invalide ou expiré
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.verify(token, secret) as JwtPayload;
};

/**
 * Vérifie et décode un refresh token
 * @param token - Refresh token à vérifier
 * @returns Payload décodé
 * @throws Si le token est invalide ou expiré
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.verify(token, secret) as JwtPayload;
};