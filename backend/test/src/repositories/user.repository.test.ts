import { userRepository } from '../../../src/repositories/user.repository';
// On importe le client Prisma pour pouvoir le mocker
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findByEmail: devrait appeler prisma.user.findUnique', async () => {
    const mockUser = { id: '1', email: 't@t.com' };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const result = await userRepository.findByEmail('t@t.com');
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('emailExists: devrait retourner true si l email est trouvé', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    const exists = await userRepository.emailExists('t@t.com');
    expect(exists).toBe(true);
  });

  it('usernameExists: devrait retourner true si le pseudo est trouvé', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
    const exists = await userRepository.usernameExists('user1');
    expect(exists).toBe(true);
  });

  it('createUser: devrait appeler prisma.user.create', async () => {
    const data = { username: 'u', email: 'e', password: 'p' };
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: '1', ...data });
    
    await userRepository.createUser(data);
    expect(prisma.user.create).toHaveBeenCalled();
  });
});