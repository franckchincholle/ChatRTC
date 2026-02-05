// Socket.IO Service
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/utils/constants';
import { SOCKET_EVENTS } from './events';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Connect to the WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupConnectionListeners();
  }

  /**
   * Setup connection event listeners
   */
  private setupConnectionListeners(): void {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to an event from the server
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Stop listening to an event
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Check if socket is connected
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Get socket ID
   */
  get id(): string | undefined {
    return this.socket?.id;
  }

  // ============================================
  // Specific event emitters
  // ============================================

  /**
   * Join a server room
   */
  joinServer(serverId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_SERVER, { serverId });
  }

  /**
   * Leave a server room
   */
  leaveServer(serverId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_SERVER, { serverId });
  }

  /**
   * Join a channel room
   */
  joinChannel(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_CHANNEL, { serverId, channelId });
  }

  /**
   * Leave a channel room
   */
  leaveChannel(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_CHANNEL, { serverId, channelId });
  }

  /**
   * Send typing indicator
   */
  sendTyping(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.TYPING, { serverId, channelId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.STOP_TYPING, { serverId, channelId });
  }
}

// Export singleton instance
export const socketService = new SocketService();