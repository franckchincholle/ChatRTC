import { messageService } from '../../../src/services/message.service';
import { messageRepository } from '../../../src/repositories/message.repository';
import { channelRepository } from '../../../src/repositories/channel.repository';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { SocketManager } from '../../../src/sockets/socket.manager';
import { ForbiddenError } from '../../../src/utils/errors';

jest.mock('../../../src/repositories/message.repository');
jest.mock('../../../src/repositories/channel.repository');
jest.mock('../../../src/repositories/server-member.repository');
jest.mock('../../../src/sockets/socket.manager');

describe('MessageService', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    const mockEmit = { emit: jest.fn() };
    const mockTo = { to: jest.fn().mockReturnValue(mockEmit) };
    (SocketManager as any).getIO = jest.fn().mockReturnValue(mockTo);
  });

  describe('sendMessage', () => {
    it('devrait envoyer un message avec succès', async () => {
      (channelRepository.findById as jest.Mock).mockResolvedValue({
        id: 'c1',
        serverId: 's1',
      });
      (serverMemberRepository.isMember as jest.Mock).mockResolvedValue(true);
      const mockMsg = { id: 'm1', content: 'Hello' };
      (messageRepository.create as jest.Mock).mockResolvedValue(mockMsg);

      const result = await messageService.sendMessage('u1', 'c1', 'Hello');

      expect(result).toEqual(mockMsg);
      const { SocketManager } = require('../../../src/sockets/socket.manager');
      expect(SocketManager.getIO).toHaveBeenCalled();
    });

    it('devrait lever NotFoundError si le channel n existe pas', async () => {
      (channelRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        messageService.sendMessage('u1', 'c1', 'Hello')
      ).rejects.toThrow();
    });
  });

  describe('deleteMessage', () => {
    it('devrait supprimer si l utilisateur est l auteur', async () => {
      const mockMsg = { id: 'm1', userId: mockUserId, channelId: 'c1' };
      (messageRepository.findById as jest.Mock).mockResolvedValue(mockMsg);
      (channelRepository.findById as jest.Mock).mockResolvedValue({
        id: 'c1',
        serverId: 's1',
      });

      const mockMember = { userId: mockUserId, role: 'MEMBER' };
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue(mockMember);

      await messageService.deleteMessage(mockUserId, 'm1');
      expect(messageRepository.delete).toHaveBeenCalledWith('m1');
    });

    it('devrait lever ForbiddenError si l utilisateur n est pas autorisé', async () => {
      (messageRepository.findById as jest.Mock).mockResolvedValue({
        id: 'm1',
        userId: 'autre',
        channelId: 'c1',
      });
      (channelRepository.findById as jest.Mock).mockResolvedValue({
        id: 'c1',
        serverId: 's1',
      });
      (
        serverMemberRepository.findByUserAndServer as jest.Mock
      ).mockResolvedValue({ role: 'MEMBER' });

      await expect(
        messageService.deleteMessage(mockUserId, 'm1')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getChannelMessages', () => {
    it('devrait retourner les messages si l utilisateur est membre', async () => {
      (channelRepository.findById as any).mockResolvedValue({
        id: 'c1',
        serverId: 's1',
      });
      (serverMemberRepository.isMember as any).mockResolvedValue(true);
      (messageRepository.findByChannelId as any).mockResolvedValue([
        { id: 'm1', content: 'hello' },
      ]);

      const result = await messageService.getChannelMessages('u1', 'c1');
      expect(result).toHaveLength(1);
    });

    it('devrait lever une ForbiddenError si l utilisateur n est pas membre du serveur', async () => {
      (channelRepository.findById as any).mockResolvedValue({
        id: 'c1',
        serverId: 's1',
      });
      (serverMemberRepository.isMember as any).mockResolvedValue(false);

      await expect(
        messageService.getChannelMessages('u1', 'c1')
      ).rejects.toThrow();
    });
  });
});
