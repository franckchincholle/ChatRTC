import { validate } from '../../../src/middlewares/validate.middleware';
import { validationResult } from 'express-validator';
import { ValidationError } from '../../../src/utils/errors';

jest.mock('express-validator');

describe('Validate Middleware - Final Coverage', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('devrait appeler next() si aucune erreur de validation (Branche Succès)', () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
    });

    validate(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('devrait throw ValidationError si des erreurs existent (Branche Erreur)', () => {
    const mockErrors = [
      { type: 'field', path: 'email', msg: 'Email invalide' },
      { type: 'other', msg: 'Erreur globale' }
    ];

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors,
    });

    expect(() => validate(req, res, next)).toThrow(ValidationError);
  });
});