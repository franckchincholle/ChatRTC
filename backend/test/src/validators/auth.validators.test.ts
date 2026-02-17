import { signupValidation, loginValidation, refreshTokenValidation } from '../../../src/validators/auth.validator';
import { validationResult } from 'express-validator';

// Fonction utilitaire pour exécuter les validations sur un objet mocké
const runValidation = async (validations: any[], data: any) => {
  const req: any = { body: data };
  for (const validation of validations) {
    await validation.run(req);
  }
  return validationResult(req);
};

describe('Auth Validator', () => {
  describe('signupValidation', () => {
    // --- Tes tests existants (CONSERVÉS) ---
    it('devrait valider un utilisateur correct', async () => {
      const data = { 
        username: 'testuser', 
        email: 'test@example.com', 
        password: 'Password123!' 
      };
      const errors = await runValidation(signupValidation, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait échouer si le username est trop court', async () => {
      const data = { username: 'ab', email: 'test@example.com', password: 'Password123!' };
      const errors = await runValidation(signupValidation, data);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()[0].msg).toBe("Le nom d'utilisateur doit contenir entre 3 et 50 caractères");
    });

    it('devrait échouer si l email est invalide', async () => {
      const data = { username: 'testuser', email: 'not-an-email', password: 'Password123!' };
      const errors = await runValidation(signupValidation, data);
      expect(errors.array().some(e => e.msg === "L'email n'est pas valide")).toBe(true);
    });

    it('devrait échouer si le password n a pas de majuscule', async () => {
      const data = { username: 'testuser', email: 't@t.com', password: 'password123' };
      const errors = await runValidation(signupValidation, data);
      expect(errors.isEmpty()).toBe(false);
    });

    // --- Nouveaux tests pour aller chercher les 10% de branches restants ---
    it('devrait échouer si le username contient des caractères spéciaux interdits', async () => {
      const data = { username: 'user@123!', email: 'test@t.com', password: 'Password123!' };
      const errors = await runValidation(signupValidation, data);
      expect(errors.array().some(e => e.msg.includes('ne peut contenir que des lettres'))).toBe(true);
    });

    it('devrait échouer si le password n a pas de chiffre', async () => {
      const data = { username: 'user123', email: 'test@t.com', password: 'OnlyLetters' };
      const errors = await runValidation(signupValidation, data);
      expect(errors.array().some(e => e.msg.includes('au moins une majuscule, une minuscule et un chiffre'))).toBe(true);
    });

    it('devrait échouer si des champs obligatoires sont manquants', async () => {
      const errors = await runValidation(signupValidation, {});
      const messages = errors.array().map(e => e.msg);
      expect(messages).toContain("Le nom d'utilisateur est requis");
      expect(messages).toContain("L'email est requis");
      expect(messages).toContain("Le mot de passe est requis");
    });
  });

  describe('loginValidation', () => {
    // --- Tes tests existants (CONSERVÉS) ---
    it('devrait valider un login correct', async () => {
      const data = { email: 'test@example.com', password: 'anyPassword' };
      const errors = await runValidation(loginValidation, data);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait échouer si le password est vide', async () => {
      const data = { email: 'test@example.com', password: '' };
      const errors = await runValidation(loginValidation, data);
      expect(errors.isEmpty()).toBe(false);
    });

    // --- Branche supplémentaire pour le login ---
    it('devrait échouer si l email est manquant au login', async () => {
      const errors = await runValidation(loginValidation, { password: '123' });
      expect(errors.array().some(e => e.msg === "L'email est requis")).toBe(true);
    });
  });

  describe('refreshTokenValidation', () => {
    // --- Branche pour couvrir refreshTokenValidation ---
    it('devrait valider un refresh token correct', async () => {
      const errors = await runValidation(refreshTokenValidation, { refreshToken: 'valid-token' });
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait échouer si le refresh token est absent', async () => {
      const errors = await runValidation(refreshTokenValidation, {});
      expect(errors.array().some(e => e.msg === "Le refresh token est requis")).toBe(true);
    });
  });
});