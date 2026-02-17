import { ChannelService } from '../../../src/services/channel.service';
import { channelRepository } from '../../../src/repositories/channel.repository';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { SocketManager } from '../../../src/sockets/socket.manager';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/channel.repository');
jest.mock('../../../src/repositories/server-member.repository');
jest.mock('../../../src/sockets/socket.manager');

describe('ChannelService', () => {
  let service: ChannelService;
  const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };

  beforeEach(() => {
    service = new ChannelService();
    jest.clearAllMocks();
    (SocketManager.getIO as jest.Mock).mockReturnValue(mockIo);
  });

  describe('createChannel', () => {
    const createData = { name: 'general', serverId: 's1' };

    it('devrait créer un channel avec succès', async () => {
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);
      (channelRepository.createChannel as jest.Mock).mockResolvedValue({
        id: 'c1',
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await service.createChannel('u1', createData);

      expect(result.name).toBe('general');
      expect(mockIo.emit).toHaveBeenCalledWith('channel:created', expect.any(Object));
    });

    it('devrait lever une ForbiddenError si l utilisateur n est pas admin/owner', async () => {
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(false);
      await expect(service.createChannel('u1', createData)).rejects.toThrow(ForbiddenError);
    });

    it('devrait lever une BadRequestError si le nom existe déjà (Prisma P2002)', async () => {
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);
      const prismaError = new Error();
      (prismaError as any).code = 'P2002';
      (channelRepository.createChannel as jest.Mock).mockRejectedValue(prismaError);

      await expect(service.createChannel('u1', createData)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getChannelsByServerId', () => {
    it('devrait retourner les channels si l utilisateur est membre', async () => {
      (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(true);
      (channelRepository.findByServerId as jest.Mock).mockResolvedValue([{ id: 'c1', name: 'chan' }]);

      const result = await service.getChannelsByServerId('u1', 's1');
      expect(result).toHaveLength(1);
    });

    it('devrait échouer si l utilisateur n est pas membre', async () => {
      (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(false);
      await expect(service.getChannelsByServerId('u1', 's1')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getChannelById', () => {
    it('devrait retourner le channel si tout est correct', async () => {
      (channelRepository.findById as jest.Mock).mockResolvedValue({ id: 'c1', serverId: 's1', name: 'test' });
      (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(true);

      const result = await service.getChannelById('u1', 'c1');
      expect(result.id).toBe('c1');
    });

    it('devrait lever NotFoundError si le channel n existe pas', async () => {
      (channelRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getChannelById('u1', 'c1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateChannel', () => {
    it('devrait mettre à jour et émettre un événement socket', async () => {
      (channelRepository.findById as jest.Mock).mockResolvedValue({ id: 'c1', serverId: 's1' });
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);
      (channelRepository.updateChannel as jest.Mock).mockResolvedValue({ id: 'c1', name: 'new', serverId: 's1' });

      const result = await service.updateChannel('u1', 'c1', { name: 'new' });
      expect(result.name).toBe('new');
      expect(mockIo.emit).toHaveBeenCalledWith('channel:updated', expect.any(Object));
    });
  });

  describe('deleteChannel', () => {
    it('devrait supprimer le channel', async () => {
      const channel = { id: 'c1', serverId: 's1' };
      (channelRepository.findById as jest.Mock).mockResolvedValue(channel);
      (serverMemberRepository.isAdminOrOwner as jest.Mock).mockResolvedValue(true);

      await service.deleteChannel('u1', 'c1');
      expect(channelRepository.deleteChannel).toHaveBeenCalledWith('c1');
      expect(mockIo.emit).toHaveBeenCalledWith('channel:deleted', expect.any(Object));
    });
  });
});