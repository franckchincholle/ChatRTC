import { ServerRepository } from '../../../src/repositories/server.repository';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    server: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    serverMember: { create: jest.fn(), update: jest.fn() },
    // On améliore le mock de transaction pour supporter les tableaux de promesses
    $transaction: jest.fn((input) => {
      if (Array.isArray(input)) return Promise.all(input);
      return input(prisma);
    }),
  },
}));

describe('ServerRepository', () => {
  const repo = new ServerRepository();

  beforeEach(() => jest.clearAllMocks());

  it('create: devrait créer un serveur et son membre owner', async () => {
    (prisma.server.create as jest.Mock).mockResolvedValue({ id: 's1' });
    
    await repo.create({ name: 'Test' }, 'u1');

    expect(prisma.server.create).toHaveBeenCalled();
    // Correction : prisma.create({ data: { ... } })
    expect(prisma.serverMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ role: 'OWNER' })
    });
  });

  it('transferOwnership: devrait fonctionner', async () => {
    await repo.transferOwnership('s1', 'old', 'new');
    expect(prisma.server.update).toHaveBeenCalled();
    expect(prisma.serverMember.update).toHaveBeenCalledTimes(2);
  });
});