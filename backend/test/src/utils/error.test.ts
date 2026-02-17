import { 
  AppError, 
  BadRequestError, 
  UnauthorizedError, 
  ForbiddenError, 
  ConflictError, 
  NotFoundError, 
  ValidationError,
  InternalServerError
} from '../../../src/utils/errors';

describe('Custom Errors - Full Coverage', () => {
  it('devrait créer des erreurs avec les bons status codes', () => {
    expect(new BadRequestError().statusCode).toBe(400);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new ConflictError().statusCode).toBe(409);
    expect(new InternalServerError().statusCode).toBe(500);
  });

  it('AppError: devrait stocker correctement le message et le code', () => {
    const error = new AppError('Custom Error', 502); 
    expect(error.message).toBe('Custom Error');
    expect(error.statusCode).toBe(502);
    expect(error.isOperational).toBe(true);
  });

  it('NotFoundError: devrait utiliser le message par défaut ou personnalisé', () => {
    const errorDefault = new NotFoundError();
    expect(errorDefault.message).toBe('Not Found');
    
    const errorCustom = new NotFoundError('Ressource absente');
    expect(errorCustom.message).toBe('Ressource absente');
  });

  it('ForbiddenError: devrait utiliser le message par défaut', () => {
    const error = new ForbiddenError();
    expect(error.message).toBe('Forbidden');
  });

  it('ValidationError: devrait stocker les erreurs de validation', () => {
    const validationErrors = [{ field: 'email', msg: 'invalide' }];
    const error = new ValidationError('Erreur de saisie', validationErrors);
    
    expect(error.statusCode).toBe(422);
    expect(error.errors).toEqual(validationErrors);
  });

  it('ValidationError: devrait fonctionner sans le paramètre errors', () => {
    const error = new ValidationError();
    expect(error.message).toBe('Validation Failed');
    expect(error.errors).toBeUndefined();
  });

  it('InternalServerError: devrait être marquée comme non-opérationnelle', () => {
    const error = new InternalServerError();
    expect(error.isOperational).toBe(false);
  });
});