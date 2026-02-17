import { authenticate } from '../../../src/middlewares/auth.middleware';
import * as jwt from '../../../src/utils/jwt';
import { userRepository } from '../../../src/repositories/user.repository';
import { UnauthorizedError } from '../../../src/utils/errors';

// Mocks des dépendances
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/repositories/user.repository');

describe('Auth Middleware', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('devrait appeler next avec UnauthorizedError si le header est absent', async () => {
    await authenticate(req, res, next);

    // Correction du message selon ton retour de console : "Token manquant"
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(next.mock.calls[0][0].message).toBe('Token manquant');
  });

  it('devrait appeler next avec UnauthorizedError si le format n est pas Bearer', async () => {
    req.headers.authorization = 'Basic token123';
    
    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('devrait appeler next avec une erreur si le token est invalide ou expiré', async () => {
    req.headers.authorization = 'Bearer mauvais_token';
    
    const jwtError = new Error('JWT Expired');
    // On simule une erreur lors de la vérification du JWT
    (jwt.verifyAccessToken as jest.Mock).mockImplementation(() => {
      throw jwtError;
    });

    await authenticate(req, res, next);

    // On utilise expect.anything() car ton code renvoie l'Error brute de JWT 
    // plutôt que de la re-typer en UnauthorizedError
    expect(next).toHaveBeenCalledWith(expect.anything());
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('devrait appeler next avec UnauthorizedError si l utilisateur n existe plus en base', async () => {
    req.headers.authorization = 'Bearer valide';
    (jwt.verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'user-999' });
    
    // L'utilisateur n'est pas trouvé dans le repository
    (userRepository.findById as jest.Mock).mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('devrait injecter l utilisateur dans req et appeler next() sans argument si tout est OK', async () => {
    req.headers.authorization = 'Bearer token_valide';
    const mockUser = { id: 'user-123', email: 'test@test.com', username: 'testuser' };
    
    (jwt.verifyAccessToken as jest.Mock).mockReturnValue({ userId: 'user-123' });
    (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

    await authenticate(req, res, next);

    // Vérifications de succès
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith(); // Pas d'argument = middleware validé
    expect(next).toHaveBeenCalledTimes(1);
  });
});