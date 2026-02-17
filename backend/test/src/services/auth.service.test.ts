import { authService } from '../../../src/services/auth.service';
import { userRepository } from '../../../src/repositories/user.repository';
import * as bcrypt from '../../../src/utils/bcrypt';
import * as jwt from '../../../src/utils/jwt';
import { UnauthorizedError, ConflictError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/utils/bcrypt');
jest.mock('../../../src/utils/jwt');

describe('AuthService', () => {
  const mockUser: any = { id: 'u1', email: 't@t.com', username: 'u', password: 'h' };

  beforeEach(() => jest.clearAllMocks());

  it('signup: devrait fonctionner', async () => {
    (userRepository.emailExists as any).mockResolvedValue(false);
    (userRepository.usernameExists as any).mockResolvedValue(false);
    (bcrypt.hashPassword as any).mockResolvedValue('hash');
    (userRepository.createUser as any).mockResolvedValue(mockUser);
    (jwt.generateAccessToken as any).mockReturnValue('a');
    (jwt.generateRefreshToken as any).mockReturnValue('r');

    const result = await authService.signup({ username: 'u', email: 't@t.com', password: 'p' });
    expect(result.accessToken).toBe('a');
  });

  it('login: devrait fonctionner', async () => {
    (userRepository.findByEmail as any).mockResolvedValue(mockUser);
    (bcrypt.comparePassword as any).mockResolvedValue(true);
    (jwt.generateAccessToken as any).mockReturnValue('a');
    (jwt.generateRefreshToken as any).mockReturnValue('r');

    const result = await authService.login({ email: 't@t.com', password: 'p' });
    expect(result.accessToken).toBeDefined();
  });

  it('refreshAccessToken: devrait lever Unauthorized si user null', async () => {
    (jwt.verifyRefreshToken as any).mockReturnValue({ userId: '1' });
    (userRepository.findById as any).mockResolvedValue(null);

    await expect(authService.refreshAccessToken('token')).rejects.toThrow(UnauthorizedError);
  });
});