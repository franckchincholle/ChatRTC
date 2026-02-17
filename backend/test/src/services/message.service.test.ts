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
  const mockServerId = 'server-456';
  const mockChannelId = 'chan-789';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de SocketManager.getIO().to().emit()
    const mockEmit = { emit: jest.fn() };
    const mockTo = { to: jest.fn().mockReturnValue(mockEmit) };
    (SocketManager as any).getIO = jest.fn().mockReturnValue(mockTo);
  });

  describe('deleteMessage', () => {
    it('devrait supprimer si l utilisateur est l auteur', async () => {
      // 1. Mock du message : On utilise userId (comme dans ton sendMessage)
      (messageRepository.findById as jest.Mock).mockResolvedValue({ 
        id: 'm1', 
        userId: mockUserId, // <--- Doit être identique au premier argument de deleteMessage
        channelId: mockChannelId 
      });

      // 2. Mock du channel
      (channelRepository.findById as jest.Mock).mockResolvedValue({ 
        id: mockChannelId, 
        serverId: mockServerId 
      });

      // 3. Mock des membres (requis pour les étapes 3 et 4 de ton service)
      const mockMember = { userId: mockUserId, serverId: mockServerId, role: 'MEMBER' };
      (serverMemberRepository.findByUserAndServer as jest.Mock).mockResolvedValue(mockMember);

      (messageRepository.delete as jest.Mock).mockResolvedValue(true);

      // ACTION
      await messageService.deleteMessage(mockUserId, 'm1');
      
      // ASSERT
      expect(messageRepository.delete).toHaveBeenCalledWith('m1');
    });

    it('devrait lever ForbiddenError si l utilisateur n est pas l auteur et pas OWNER', async () => {
      // Message d'un autre utilisateur
      (messageRepository.findById as jest.Mock).mockResolvedValue({ 
        id: 'm1', 
        userId: 'autre-utilisateur', 
        channelId: mockChannelId 
      });
      (channelRepository.findById as jest.Mock).mockResolvedValue({ id: mockChannelId, serverId: mockServerId });
      
      // Le demandeur est un simple membre
      (serverMemberRepository.findByUserAndServer as jest.Mock).mockResolvedValue({ 
        userId: mockUserId, 
        role: 'MEMBER' 
      });

      await expect(messageService.deleteMessage(mockUserId, 'm1'))
        .rejects.toThrow(ForbiddenError);
    });
  });
});