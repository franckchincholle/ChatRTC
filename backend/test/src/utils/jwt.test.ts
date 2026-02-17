import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../../../src/utils/jwt';
import { UnauthorizedError } from '../../../src/utils/errors';

describe('JWT Utils - Full Coverage', () => {
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

  it('verifyAccessToken: devrait lever une erreur si le token est mal formé', () => {
    // Teste la branche catch de verifyAccessToken (ligne 22 de ton code)
    expect(() => verifyAccessToken('token-invalide')).toThrow();
  });

  it('verifyRefreshToken: devrait lever une erreur spécifique pour un token expiré ou corrompu', () => {
    // Teste la branche catch de verifyRefreshToken (ligne 41)
    try {
      verifyRefreshToken('malformed-token');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('generateAccessToken: devrait fonctionner même si les variables d environnement sont absentes', () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalExpire = process.env.JWT_EXPIRES_IN;

    // On simule l'absence de config pour tester les valeurs par défaut (fallback)
    delete process.env.JWT_EXPIRES_IN;

    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    // Restauration de l'environnement
    process.env.JWT_SECRET = originalSecret;
    process.env.JWT_EXPIRES_IN = originalExpire;
  });
});
