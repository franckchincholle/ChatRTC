import { authService } from '../../../src/services/auth.service';
import { userRepository } from '../../../src/repositories/user.repository';
import * as bcrypt from '../../../src/utils/bcrypt';
import * as jwt from '../../../src/utils/jwt';
import { UnauthorizedError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/bcrypt');
jest.mock('../../../src/utils/jwt');

describe('AuthService', () => {
  const mockUser: any = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signup: devrait inscrire un utilisateur avec succès', async () => {
    (userRepository.emailExists as any).mockResolvedValue(false);
    (userRepository.usernameExists as any).mockResolvedValue(false);
    (bcrypt.hashPassword as any).mockResolvedValue('hashed_pwd');
    (userRepository.createUser as any).mockResolvedValue(mockUser);
    (jwt.generateAccessToken as any).mockReturnValue('access');
    (jwt.generateRefreshToken as any).mockReturnValue('refresh');

    const result = await authService.signup({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('access');
  });

  describe('login', () => {
    it('devrait connecter un utilisateur et renvoyer des tokens', async () => {
      (userRepository.findByEmail as any).mockResolvedValue(mockUser);
      (bcrypt.comparePassword as any).mockResolvedValue(true);
      (jwt.generateAccessToken as any).mockReturnValue('access');
      (jwt.generateRefreshToken as any).mockReturnValue('refresh');

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.accessToken).toBeDefined();
    });

    it('devrait lever une erreur si le mot de passe est faux', async () => {
      (userRepository.findByEmail as any).mockResolvedValue(mockUser);
      (bcrypt.comparePassword as any).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshAccessToken', () => {
    it('devrait générer un nouveau access token', async () => {
      (jwt.verifyRefreshToken as any).mockReturnValue({ userId: 'user-123' });
      (userRepository.findById as any).mockResolvedValue(mockUser);
      (jwt.generateAccessToken as any).mockReturnValue('new_access_token');

      const result = await authService.refreshAccessToken('valid-refresh-token');
      expect(result.accessToken).toBe('new_access_token');
    });
  });
});