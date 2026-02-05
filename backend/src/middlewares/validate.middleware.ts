import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Middleware pour vérifier les erreurs de validation
 * À utiliser après les validateurs express-validator
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formater les erreurs de manière lisible
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : undefined,
      message: err.msg,
    }));
    
    throw new ValidationError('Validation échouée', formattedErrors);
  }
  
  next();
};