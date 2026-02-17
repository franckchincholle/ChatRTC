import { authService } from '../../../src/services/auth.service';
import { userRepository } from '../../../src/repositories/user.repository';
import { hashPassword, comparePassword } from '../../../src/utils/bcrypt';
import { UnauthorizedError, ConflictError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/bcrypt');
jest.mock('../../../src/utils/jwt');

describe('AuthService', () => {
  const mockUser = {
    id: 'u1',
    username: 'testuser',
    email: 'test@t.com',
    password: 'hashed_password',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginData = { email: 'test@t.com', password: 'password123' };

    it('devrait retourner l utilisateur et les tokens si les identifiants sont corrects', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(result.user.email).toBe(loginData.email);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('devrait lever UnauthorizedError si l utilisateur n existe pas', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('devrait lever UnauthorizedError si le mot de passe est incorrect', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('signup', () => {
    const signupData = {
      username: 'newuser',
      email: 'new@t.com',
      password: 'Password123!',
    };

    it('devrait créer un utilisateur si les données sont uniques', async () => {
      (userRepository.emailExists as jest.Mock).mockResolvedValue(false);
      (userRepository.usernameExists as jest.Mock).mockResolvedValue(false);
      (hashPassword as jest.Mock).mockResolvedValue('hashed');
      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signup(signupData);
      expect(result.user.username).toBe(mockUser.username);
    });

    it('devrait lever ConflictError si l email est déjà utilisé', async () => {
      (userRepository.emailExists as jest.Mock).mockResolvedValue(true);

      await expect(authService.signup(signupData)).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('devrait lever UnauthorizedError si l utilisateur n existe plus', async () => {

      const { verifyRefreshToken } = require('../../../src/utils/jwt');
      (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'u1' });
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken('fake_token')
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
