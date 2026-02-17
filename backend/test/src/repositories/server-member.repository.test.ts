import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    serverMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ServerMemberRepository', () => {
  it('isMember: devrait retourner true si l utilisateur existe', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({
      userId: 'u1',
    });
    const result = await serverMemberRepository.isMember('u1', 's1');
    expect(result).toBe(true);
  });

  it('isAdminOrOwner: devrait valider les rôles ADMIN ou OWNER', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({
      role: 'ADMIN',
    });
    const result = await serverMemberRepository.isAdminOrOwner('u1', 's1');
    expect(result).toBe(true);
  });

  it('countByServerId: devrait retourner le nombre de membres', async () => {
    (prisma.serverMember.count as jest.Mock).mockResolvedValue(10);
    const count = await serverMemberRepository.countByServerId('s1');
    expect(count).toBe(10);
  });

  it('findByServerId: devrait appeler findMany avec le bon format', async () => {
    await serverMemberRepository.findByServerId('s1');
    expect(prisma.serverMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { serverId: 's1' },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      })
    );
  });

  it('addMember: devrait créer un membre avec le rôle MEMBER par défaut', async () => {
    await serverMemberRepository.addMember('u2', 's1');
    expect(prisma.serverMember.create).toHaveBeenCalledWith({
      data: { userId: 'u2', serverId: 's1', role: 'MEMBER' },
    });
  });

  it('updateRole: devrait mettre à jour le rôle d un membre', async () => {
    await serverMemberRepository.updateRole('u1', 's1', 'ADMIN');
    expect(prisma.serverMember.update).toHaveBeenCalledWith({
      where: { userId_serverId: { userId: 'u1', serverId: 's1' } },
      data: { role: 'ADMIN' },
    });
  });

  it('findByUserAndServer: devrait retourner le membre unique', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({
      userId: 'u1',
      serverId: 's1',
    });
    await serverMemberRepository.findByUserAndServer('u1', 's1');
    expect(prisma.serverMember.findUnique).toHaveBeenCalled();
  });

  it('isOwner: devrait retourner true si le rôle est OWNER', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({
      role: 'OWNER',
    });
    const result = await serverMemberRepository.isOwner('u1', 's1');
    expect(result).toBe(true);
  });

  it('removeMember: devrait appeler prisma.delete', async () => {
    await serverMemberRepository.removeMember('u1', 's1');
    expect(prisma.serverMember.delete).toHaveBeenCalled();
  });

  it('isAdminOrOwner: devrait retourner false si le membre n existe pas', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await serverMemberRepository.isAdminOrOwner('u1', 's1');
    expect(result).toBe(false);
  });

  it('isOwner: devrait retourner false si le rôle est MEMBER', async () => {
    (prisma.serverMember.findUnique as jest.Mock).mockResolvedValue({
      role: 'MEMBER',
    });
    const result = await serverMemberRepository.isOwner('u1', 's1');
    expect(result).toBe(false);
  });
});
