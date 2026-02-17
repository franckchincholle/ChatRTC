import { SocketManager } from '../../../src/sockets/socket.manager';
import { Server } from 'http';

describe('SocketManager', () => {
  it('should throw error if getIO is called before init', () => {
    (SocketManager as any).io = null;
    // On met le message exact reçu dans la console
    expect(() => SocketManager.getIO()).toThrow("Socket.io n'est pas initialisé. Appelez SocketManager.init(server) d'abord.");
  });

  it('should initialize correctly', () => {
    const httpServer = new Server();
    const io = SocketManager.init(httpServer);
    expect(io).toBeDefined();
    expect(SocketManager.getIO()).toBe(io);
  });
});