import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../src/utils/jwt';
import { UnauthorizedError } from '../../../src/utils/errors';

describe('JWT Utils', () => {
  const payload = { userId: '123', username: 'test', email: 't@t.com' };

  it('devrait générer un access token valide', () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
  });

  it('devrait générer et vérifier un refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it('devrait lever une erreur pour un token invalide', () => {
    expect(() => verifyRefreshToken('token-bidon')).toThrow();
  });
});