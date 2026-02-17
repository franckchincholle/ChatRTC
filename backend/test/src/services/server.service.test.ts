import { ServerService } from '../../../src/services/server.service';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { SocketManager } from '../../../src/sockets/socket.manager';
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from '../../../src/utils/errors';

jest.mock('../../../src/repositories/server.repository');
jest.mock('../../../src/repositories/server-member.repository');
jest.mock('../../../src/sockets/socket.manager');

describe('ServerService - Extended Coverage', () => {
  let service: ServerService;
  let mockRepo: any;
  const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

  beforeEach(() => {
    service = new ServerService();
    mockRepo = (service as any).serverRepository;
    jest.clearAllMocks();
    (SocketManager.getIO as jest.Mock).mockReturnValue(mockIo);
  });

  const setupRoles = (reqRole: string | null, targetRole: string | null) => {
    (
      serverMemberRepository.findByUserAndServer as jest.Mock
    ).mockImplementation((uid) => {
      if (uid === 'requester')
        return Promise.resolve(reqRole ? { role: reqRole } : null);
      if (uid === 'target')
        return Promise.resolve(targetRole ? { role: targetRole } : null);
      return Promise.resolve(null);
    });
  };

  describe('joinServer', () => {
    it('devrait rejoindre un serveur avec un code valide', async () => {
      const invitation = { serverId: 's1', code: 'xyz' };
      mockRepo.findInvitationByCode.mockResolvedValue(invitation);
      (serverMemberRepository.addMember as jest.Mock).mockResolvedValue({
        userId: 'u1',
        serverId: 's1',
      });

      const result = await service.joinServer('xyz', 'u1');
      expect(result.serverId).toBe('s1');
      expect(mockIo.emit).toHaveBeenCalledWith(
        'server:member_joined',
        expect.any(Object)
      );
    });

    it('devrait lever BadRequestError si le code est invalide', async () => {
      mockRepo.findInvitationByCode.mockResolvedValue(null);
      await expect(service.joinServer('bad', 'u1')).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('updateMemberRole Branches', () => {
    it('devrait mettre à jour le rôle si le demandeur est OWNER', async () => {
      setupRoles('OWNER', 'MEMBER');
      (serverMemberRepository.updateRole as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
      });

      const result = await service.updateMemberRole(
        's1',
        'requester',
        'target',
        'ADMIN'
      );
      expect(result.role).toBe('ADMIN');
    });

    it('devrait empêcher de changer le rôle du OWNER', async () => {
      setupRoles('ADMIN', 'OWNER');
      await expect(
        service.updateMemberRole('s1', 'requester', 'target', 'MEMBER')
      ).rejects.toThrow('Cannot change role of the server owner');
    });

    it('devrait empêcher un ADMIN de modifier un autre ADMIN', async () => {
      setupRoles('ADMIN', 'ADMIN');
      await expect(
        service.updateMemberRole('s1', 'requester', 'target', 'MEMBER')
      ).rejects.toThrow('Admins cannot change roles of other admins');
    });

    it('devrait lever ForbiddenError si le demandeur n est pas ADMIN/OWNER', async () => {
      setupRoles('MEMBER', 'MEMBER');
      await expect(
        service.updateMemberRole('s1', 'requester', 'target', 'ADMIN')
      ).rejects.toThrow(ForbiddenError);
    });

    it('devrait lever NotFoundError si la cible n est pas sur le serveur', async () => {
      setupRoles('OWNER', null);
      await expect(
        service.updateMemberRole('s1', 'requester', 'target', 'ADMIN')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('transferOwnership & Server Ops', () => {
    it('transferOwnership: devrait lever ForbiddenError si le demandeur n est pas le proprio', async () => {
      mockRepo.findById.mockResolvedValue({ id: 's1', ownerId: 'other' });
      await expect(service.transferOwnership('s1', 'me', 'u2')).rejects.toThrow(
        'Only the current owner can transfer ownership'
      );
    });

    it('transferOwnership: devrait échouer si le serveur n existe pas', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(
        service.transferOwnership('fake', 'u1', 'u2')
      ).rejects.toThrow('Server not found');
    });

    it('deleteServer: devrait lever ForbiddenError si non proprio', async () => {
      mockRepo.findById.mockResolvedValue({ id: 's1', ownerId: 'other' });
      await expect(service.deleteServer('s1', 'me')).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe('Invitation & Members', () => {
    it('generatedInviteCode: devrait lever ForbiddenError si simple MEMBER', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });
      await expect(service.generatedInviteCode('s1', 'u1')).rejects.toThrow(
        ForbiddenError
      );
    });

    it('getServerMembers: devrait appeler le repository', async () => {
      (serverMemberRepository.findByServerId as jest.Mock).mockResolvedValue(
        []
      );
      await service.getServerMembers('s1');
      expect(serverMemberRepository.findByServerId).toHaveBeenCalledWith('s1');
    });
  });
});
