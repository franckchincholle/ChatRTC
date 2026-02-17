import { SocketManager } from '../../../src/sockets/socket.manager';
import { Server as HTTPServer } from 'http';

// On mocke le repository pour éviter les appels DB réels lors de la connexion
jest.mock('../../../src/repositories/server.repository');

describe('SocketManager', () => {
  let httpServer: HTTPServer;

  beforeEach(() => {
    httpServer = new HTTPServer();
    (SocketManager as any).io = null;
    jest.clearAllMocks();
  });

  it('should throw error if getIO is called before init', () => {
    expect(() => SocketManager.getIO()).toThrow("Socket.io n'est pas initialisé. Appelez SocketManager.init(server) d'abord.");
  });

  it('should initialize correctly', () => {
    const io = SocketManager.init(httpServer);
    expect(io).toBeDefined();
    expect(SocketManager.getIO()).toBe(io);
  });

  it('devrait gérer la connexion d un utilisateur et rejoindre les rooms', async () => {
    const io = SocketManager.init(httpServer);
    
    // On mocke la réponse des serveurs de l'utilisateur
    const mockServers = [{ id: 'server-1' }];
    const { serverRepository } = require('../../../src/repositories/server.repository');
    serverRepository.findByUserId = jest.fn().mockResolvedValue(mockServers);

    // Création d'un mock de socket avec les propriétés attendues par SocketManager
    const mockSocket: any = {
      id: 'socket-id',
      data: { userId: 'user-123' },
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn()
    };

    // Au lieu de io.emit, on récupère directement le listener enregistré par SocketManager
    // @ts-ignore - Accès aux listeners internes pour le test
    const connectionListener = io.listeners('connection')[0];
    
    // On exécute manuellement le listener de connexion
    await connectionListener(mockSocket);

    // Vérifications
    expect(serverRepository.findByUserId).toHaveBeenCalledWith('user-123');
    expect(mockSocket.join).toHaveBeenCalledWith('server:server-1');
    expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
  });
});