import { errorHandler } from '../../../src/middlewares/error.middleware';
import { ValidationError } from '../../../src/utils/errors';

describe('Error Middleware - Final Branch Fix', () => {
  let req: any, res: any, next: any;
  let consoleSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = { originalUrl: '/test' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('Branche ValidationError : devrait inclure .errors et retourner 422', () => {
    const error = new ValidationError('Validation Failed', { email: 'Invalid format' });
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      errors: { email: 'Invalid format' }
    }));
  });

  it('Branche Prisma : devrait gérer PrismaClientKnownRequestError', () => {
    const error = new Error('Database Error');
    error.name = 'PrismaClientKnownRequestError';
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Erreur de base de données'
    }));
  });

  it('Branche JWT : devrait gérer TokenExpiredError', () => {
    const error = new Error('Expired');
    error.name = 'TokenExpiredError';
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token expiré'
    }));
  });

  it('Branche Environnement : devrait gérer le mode production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Internal');
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Une erreur interne est survenue'
    }));
  });

  it('Branche Environnement : devrait inclure la stack trace en development', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Debug error');
    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      stack: expect.any(String)
    }));
  });
});