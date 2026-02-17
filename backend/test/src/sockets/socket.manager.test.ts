import { SocketManager } from '../../../src/sockets/socket.manager';
import { Server as HTTPServer } from 'http';

jest.mock('../../../src/repositories/server.repository');

describe('SocketManager', () => {
  let httpServer: HTTPServer;

  beforeEach(() => {
    httpServer = new HTTPServer();
    (SocketManager as any).io = null;
    (SocketManager as any).onlineUsers = new Map();
    jest.clearAllMocks();
  });

  it('should throw error if getIO is called before init', () => {
    expect(() => SocketManager.getIO()).toThrow(
      "Socket.io n'est pas initialisé."
    );
  });

  it('should initialize correctly', () => {
    const io = SocketManager.init(httpServer);
    expect(io).toBeDefined();
    expect(SocketManager.getIO()).toBe(io);
  });

  it('devrait gérer la connexion d un utilisateur et rejoindre les rooms', async () => {
    const io = SocketManager.init(httpServer);

    const mockServers = [{ id: 'server-1' }];

    const repoInstance = (SocketManager as any).serverRepository;
    const findSpy = jest
      .spyOn(repoInstance, 'findByUserId')
      .mockResolvedValue(mockServers);

    const mockSocket: any = {
      id: 'socket-id',
      data: { userId: 'user-123', username: 'testuser' },
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn(),
      rooms: new Set(['socket-id']),
    };

    const connectionListener = io.listeners('connection')[0];

    await connectionListener(mockSocket);

    expect(findSpy).toHaveBeenCalledWith('user-123');
    expect(mockSocket.join).toHaveBeenCalledWith('server:server-1');
    expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');

    const onlineUsers = SocketManager.getOnlineUsers('server-1');
    expect(onlineUsers).toContain('user-123');
  });

  it('devrait gérer les événements de typing', async () => {
    const io = SocketManager.init(httpServer);
    const repoInstance = (SocketManager as any).serverRepository;
    jest.spyOn(repoInstance, 'findByUserId').mockResolvedValue([]);

    let typingCallback: any;
    const mockSocket: any = {
      data: { userId: 'u1', username: 'user1' },
      join: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === 'user:typing') typingCallback = cb;
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      rooms: new Set(),
    };

    const connectionListener = io.listeners('connection')[0];
    await connectionListener(mockSocket);

    typingCallback({ channelId: 'c1', serverId: 's1' });

    expect(mockSocket.to).toHaveBeenCalledWith('channel:c1');
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'user:typing',
      expect.objectContaining({
        channelId: 'c1',
        user: { userId: 'u1', username: 'user1' },
      })
    );
  });

  it('devrait gérer la déconnexion d un utilisateur', async () => {
    const io = SocketManager.init(httpServer);
    const repoInstance = (SocketManager as any).serverRepository;
    jest.spyOn(repoInstance, 'findByUserId').mockResolvedValue([{ id: 's1' }]);

    let disconnectCallback: any;
    const mockSocket: any = {
      data: { userId: 'u1' },
      join: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === 'disconnect') disconnectCallback = cb;
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      rooms: new Set(),
    };

    const connectionListener = io.listeners('connection')[0];
    await connectionListener(mockSocket);

    disconnectCallback();

    const online = SocketManager.getOnlineUsers('s1');
    expect(online).not.toContain('u1');
  });
});
