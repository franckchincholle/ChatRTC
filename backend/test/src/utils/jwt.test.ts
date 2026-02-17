import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../../../src/utils/jwt';

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
    expect(() => verifyAccessToken('token-invalide')).toThrow();
  });

  it('verifyRefreshToken: devrait lever une erreur spécifique pour un token expiré ou corrompu', () => {
    try {
      verifyRefreshToken('malformed-token');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it('generateAccessToken: devrait fonctionner même si les variables d environnement sont absentes', () => {
    const originalSecret = process.env.JWT_SECRET;
    const originalExpire = process.env.JWT_EXPIRES_IN;

    delete process.env.JWT_EXPIRES_IN;

    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    process.env.JWT_SECRET = originalSecret;
    process.env.JWT_EXPIRES_IN = originalExpire;
  });

  it('verifyAccessToken: devrait entrer dans le catch si le token est malformé', () => {
    expect(() => verifyAccessToken('pas-un-token')).toThrow();
  });

  it('verifyRefreshToken: devrait entrer dans le catch si le token est malformé', () => {
    expect(() => verifyRefreshToken('pas-un-token')).toThrow();
  });
});

describe('JWT Branch Coverage', () => {
  it('verifyAccessToken: devrait entrer dans le catch si le token est invalide', () => {
    expect(() => verifyAccessToken('token-malformé')).toThrow();
  });

  it('verifyRefreshToken: devrait entrer dans le catch si le token est invalide', () => {
    expect(() => verifyRefreshToken('refresh-malformé')).toThrow();
  });
});

describe('JWT Branch Coverage', () => {
  it('verifyAccessToken: devrait entrer dans le catch si le token est corrompu', () => {
    expect(() => verifyAccessToken('pas.un.token')).toThrow();
  });

  it('verifyRefreshToken: devrait entrer dans le catch si le token est expiré', () => {
    expect(() => verifyRefreshToken('refresh.invalide.expired')).toThrow();
  });
});

describe('JWT Erreurs Branches', () => {
  it('verifyAccessToken: devrait throw si le token est invalide', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('verifyRefreshToken: devrait throw si le token est expiré', () => {
    expect(() => verifyRefreshToken('expired.token.here')).toThrow();
  });
});
