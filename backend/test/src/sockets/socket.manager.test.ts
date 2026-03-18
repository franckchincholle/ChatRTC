import { SocketManager } from '../../../src/sockets/socket.manager';
import { Server as HTTPServer } from 'http';

jest.mock('../../../src/repositories/server.repository');

describe('SocketManager', () => {
  let httpServer: HTTPServer;

  beforeEach(() => {
    httpServer = new HTTPServer();
    (SocketManager as any).io = null;
    (SocketManager as any).onlineUsers = new Map();
    (SocketManager as any).userSockets = new Map();
    jest.clearAllMocks();
  });

  it('should throw error if getIO is called before init', () => {
    expect(() => SocketManager.getIO()).toThrow("Socket.io n'est pas initialisé.");
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
    const findSpy = jest.spyOn(repoInstance, 'findByUserId').mockResolvedValue(mockServers);

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

    const eventCallbacks: Record<string, any> = {};
    const mockSocket: any = {
      data: { userId: 'u1', username: 'user1' },
      join: jest.fn(),
      on: jest.fn((event, cb) => { eventCallbacks[event] = cb; }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      rooms: new Set(),
    };

    const connectionListener = io.listeners('connection')[0];
    await connectionListener(mockSocket);

    eventCallbacks['user:typing']({ channelId: 'c1', serverId: 's1' });

    expect(mockSocket.to).toHaveBeenCalledWith('channel:c1');
    expect(mockSocket.emit).toHaveBeenCalledWith('user:typing', expect.objectContaining({
      channelId: 'c1',
      user: { userId: 'u1', username: 'user1' },
    }));
  });

  it('devrait gérer la déconnexion d un utilisateur', async () => {
    const io = SocketManager.init(httpServer);
    const repoInstance = (SocketManager as any).serverRepository;
    jest.spyOn(repoInstance, 'findByUserId').mockResolvedValue([{ id: 's1' }]);

    (SocketManager as any).onlineUsers.set('s1', new Set(['u1']));

    const eventCallbacks: Record<string, any> = {};
    const mockSocket: any = {
      data: { userId: 'u1' },
      id: 'socket-id',
      join: jest.fn(),
      on: jest.fn((event, cb) => { eventCallbacks[event] = cb; }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      // rooms doit contenir la room serveur pour que disconnecting la trouve
      rooms: new Set(['socket-id', 'server:s1']),
    };

    const connectionListener = io.listeners('connection')[0];
    await connectionListener(mockSocket);

    // Le code utilise 'disconnecting' et non 'disconnect'
    expect(eventCallbacks['disconnecting']).toBeDefined();
    eventCallbacks['disconnecting']();

    const online = SocketManager.getOnlineUsers('s1');
    expect(online).not.toContain('u1');
  });
});