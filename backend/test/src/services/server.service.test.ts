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

  describe('generatedInviteCode', () => {
    it('devrait générer un code pour un OWNER ou ADMIN', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'ADMIN' });
      mockRepo.createInvitation.mockResolvedValue(true);

      const code = await service.generatedInviteCode('s1', 'u1');

      expect(code).toBeDefined();
      expect(mockRepo.createInvitation).toHaveBeenCalled();
    });

    it('devrait lever ForbiddenError si l utilisateur n est qu un simple MEMBER', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });
      await expect(service.generatedInviteCode('s1', 'u1')).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe('updateMemberRole', () => {
    it('devrait mettre à jour le rôle si le demandeur est OWNER', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ role: 'MEMBER' });

      (serverMemberRepository.updateRole as jest.Mock).mockResolvedValue({
        role: 'ADMIN',
      });

      const result = await service.updateMemberRole(
        's1',
        'admin_id',
        'target_id',
        'ADMIN'
      );
      expect(result.role).toBe('ADMIN');
    });

    it('devrait interdire à un ADMIN de modifier un autre ADMIN', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce({ role: 'ADMIN' });

      await expect(
        service.updateMemberRole('s1', 'a1', 'a2', 'MEMBER')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('ServerService - Advanced Operations', () => {
    it('transferOwnership: devrait lever ForbiddenError si l utilisateur n est pas le proprio', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({
        id: 's1',
        ownerId: 'other-user',
      });
      await expect(
        service.transferOwnership('s1', 'user-123', 'new-owner')
      ).rejects.toThrow('Only the current owner can transfer ownership');
    });

    it('updateMemberRole: devrait empêcher un ADMIN de modifier un autre ADMIN', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce({ role: 'ADMIN' });

      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'MEMBER')
      ).rejects.toThrow('Admins cannot change roles of other admins');
    });

    it('getServerMembers: devrait appeler le repository', async () => {
      (serverMemberRepository.findByServerId as jest.Mock).mockResolvedValue(
        []
      );
      await service.getServerMembers('s1');
      expect(serverMemberRepository.findByServerId).toHaveBeenCalledWith('s1');
    });
  });

  describe('ServerService - Branch Coverage', () => {
    it('transferOwnership: devrait lever ForbiddenError si l utilisateur n est pas le proprio', async () => {
      (mockRepo.findById as jest.Mock).mockResolvedValue({
        id: 's1',
        ownerId: 'not-me',
      });
      await expect(
        service.transferOwnership('s1', 'me', 'other')
      ).rejects.toThrow('Only the current owner can transfer ownership');
    });

    it('updateMemberRole: devrait lever ForbiddenError si le demandeur n est pas ADMIN/OWNER', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });
      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'ADMIN')
      ).rejects.toThrow('You do not have permission to update member roles');
    });

    it('updateMemberRole: devrait empêcher de changer le rôle du OWNER', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ role: 'OWNER' });

      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'ADMIN')
      ).rejects.toThrow('Cannot change role of the server owner');
    });
  });

  describe('ServerService - Branch Coverage', () => {
    it('transferOwnership: devrait lever ForbiddenError si l utilisateur n est pas le proprio', async () => {
      mockRepo.findById.mockResolvedValue({ id: 's1', ownerId: 'not-me' });
      await expect(
        service.transferOwnership('s1', 'me', 'other')
      ).rejects.toThrow(ForbiddenError);
    });

    it('updateMemberRole: devrait empêcher de changer le rôle du OWNER', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce({ role: 'OWNER' });

      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'ADMIN')
      ).rejects.toThrow('Cannot change role of the server owner');
    });

    it('updateMemberRole: devrait lever ForbiddenError si le demandeur n est pas ADMIN/OWNER', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });
      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'ADMIN')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('ServerService - Branch Coverage Security', () => {
    it('updateMemberRole: devrait lever ForbiddenError si l utilisateur n est pas ADMIN ou OWNER', async () => {
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });
      await expect(
        service.updateMemberRole('s1', 'u1', 'u2', 'ADMIN')
      ).rejects.toThrow(ForbiddenError);
    });

    it('updateMemberRole: devrait empêcher un ADMIN de modifier un autre ADMIN', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce({ role: 'ADMIN' });

      await expect(
        service.updateMemberRole('s1', 'a1', 'a2', 'MEMBER')
      ).rejects.toThrow('Admins cannot change roles of other admins');
    });

    it('updateMemberRole: devrait lever NotFoundError si la cible n est pas sur le serveur', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'OWNER' })
        .mockResolvedValueOnce(null);

      await expect(
        service.updateMemberRole('s1', 'owner_id', 'ghost_id', 'ADMIN')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('ServerService - Branch Security Coverage', () => {
    it('updateMemberRole: devrait empêcher un ADMIN de modifier un autre ADMIN', async () => {
      (serverMemberRepository.findByUserAndServer as jest.Mock)
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce({ role: 'ADMIN' });

      await expect(
        service.updateMemberRole('s1', 'admin-id', 'target-id', 'MEMBER')
      ).rejects.toThrow('Admins cannot change roles of other admins');
    });

    it('transferOwnership: devrait échouer si le serveur n existe pas', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(
        service.transferOwnership('fake', 'u1', 'u2')
      ).rejects.toThrow('Server not found');
    });

    it('transferOwnership: devrait échouer si le nouveau proprio n est pas sur le serveur', async () => {
      mockRepo.findById.mockResolvedValue({ id: 's1', ownerId: 'u1' });
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.transferOwnership('s1', 'u1', 'u2')).rejects.toThrow(
        'New owner must be on the server'
      );
    });
  });
});
