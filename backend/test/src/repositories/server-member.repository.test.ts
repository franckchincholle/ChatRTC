import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    serverMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ServerMemberRepository', () => {
  it('isMember: devrait retourner true si l utilisateur existe', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({ userId: 'u1' });
    const result = await serverMemberRepository.isMember('u1', 's1');
    expect(result).toBe(true);
  });

  it('isAdminOrOwner: devrait valider les rôles ADMIN ou OWNER', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({ role: 'ADMIN' });
    const result = await serverMemberRepository.isAdminOrOwner('u1', 's1');
    expect(result).toBe(true);
  });

  it('countByServerId: devrait retourner le nombre de membres', async () => {
    (prisma.serverMember.count as jest.Mock).mockResolvedValue(10);
    const count = await serverMemberRepository.countByServerId('s1');
    expect(count).toBe(10);
  });
});