import { ServerService } from '../../../src/services/server.service';
import { ServerRepository } from '../../../src/repositories/server.repository';
import { serverMemberRepository } from '../../../src/repositories/server-member.repository';
import { SocketManager } from '../../../src/sockets/socket.manager';

// On mocke les dépendances
jest.mock('../../../src/repositories/server.repository');
jest.mock('../../../src/repositories/server-member.repository');
jest.mock('../../../src/sockets/socket.manager');

describe('ServerService', () => {
  let service: ServerService;
  let mockRepo: any;

  beforeEach(() => {
    service = new ServerService();
    // On récupère l'instance créée dans le constructeur via any
    mockRepo = (service as any).serverRepository;
    jest.clearAllMocks();
  });

  it('createServer: devrait appeler le repository avec succès', async () => {
    const mockData = { name: 'Mon Serveur' };
    const mockServer = { id: 's1', ...mockData, ownerId: 'u1' };
    
    // Correction image_2481d5 : appel sur l'instance mockée
    mockRepo.create.mockResolvedValue(mockServer);

    const result = await service.createServer('u1', mockData);
    
    expect(mockRepo.create).toHaveBeenCalledWith(mockData, 'u1');
    expect(result.id).toBe('s1');
  });

  it('leaveServer: devrait lever ForbiddenError si le propriétaire tente de quitter', async () => {
    const mockServer = { id: 's1', ownerId: 'u1' };
    mockRepo.findById.mockResolvedValue(mockServer);

    // Teste la branche de la ligne 27 de ton service
    await expect(service.leaveServer('s1', 'u1'))
      .rejects.toThrow('Owner cannot leave the server');
  });

  it('deleteServer: devrait émettre un événement socket et supprimer le serveur', async () => {
    const mockServer = { id: 's1', ownerId: 'u1' };
    mockRepo.findById.mockResolvedValue(mockServer);
    mockRepo.delete.mockResolvedValue(mockServer);

    // Mock de SocketManager
    const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    (SocketManager.getIO as jest.Mock).mockReturnValue(mockIo);

    await service.deleteServer('s1', 'u1');

    expect(mockRepo.delete).toHaveBeenCalledWith('s1');
    // Vérifie l'émission socket (Ligne 140)
    expect(mockIo.emit).toHaveBeenCalledWith('server:deleted', { serverId: 's1' });
  });
});