import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

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

export const verifyAccessToken = (token: string): JwtPayload => {
  const secret = env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.verify(token, secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.verify(token, secret) as JwtPayload;
};