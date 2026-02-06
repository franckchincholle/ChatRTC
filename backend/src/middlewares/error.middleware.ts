import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

/**
 * Middleware global de gestion des erreurs
 * 
 * Ce middleware doit être placé APRÈS toutes les routes dans server.ts
 * Il attrape toutes les erreurs passées via next(error)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Si c'est une de nos erreurs custom (AppError ou ses sous-classes)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      // Inclure les détails de validation si présents
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  // 2. Erreurs Prisma (base de données)
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de base de données',
    });
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides pour la base de données',
    });
  }

  // 3. Erreurs JWT (jsonwebtoken)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré',
    });
  }

  // 4. Erreur inconnue (bug dans le code)
  console.error('❌ Erreur non gérée:', err);
  
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur interne est survenue' 
      : err.message,
    // En développement, inclure la stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};