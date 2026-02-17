import { SocketManager } from '../../../src/sockets/socket.manager';
import { Server as HTTPServer } from 'http';

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

    const mockServers = [{ id: 'server-1' }];
    const { serverRepository } = require('../../../src/repositories/server.repository');
    serverRepository.findByUserId = jest.fn().mockResolvedValue(mockServers);

    const mockSocket: any = {
      id: 'socket-id',
      data: { userId: 'user-123' },
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn()
    };

    const connectionListener = io.listeners('connection')[0];
    
    await connectionListener(mockSocket);

    expect(serverRepository.findByUserId).toHaveBeenCalledWith('user-123');
    expect(mockSocket.join).toHaveBeenCalledWith('server:server-1');
    expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
  });
});