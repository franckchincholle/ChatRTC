import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/utils/constants';
import { SOCKET_EVENTS } from './events';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private pendingListeners: { event: string; callback: (data: unknown) => void }[] = [];

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

    // Appliquer les listeners enregistrés avant la connexion
    this.pendingListeners.forEach(({ event, callback }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket!.on(event, callback as any);
    });
    this.pendingListeners = [];

    this.setupConnectionListeners();
  }

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

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event: string, data?: unknown): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.socket) {
      this.pendingListeners.push({ event, callback });
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.socket.on(event, callback as any);
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (!this.socket) {
      if (callback) {
        this.pendingListeners = this.pendingListeners.filter(
          (l) => !(l.event === event && l.callback === callback)
        );
      } else {
        this.pendingListeners = this.pendingListeners.filter((l) => l.event !== event);
      }
      return;
    }
    if (callback) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket.off(event, callback as any);
    } else {
      this.socket.off(event);
    }
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  get id(): string | undefined {
    return this.socket?.id;
  }

  joinServer(serverId: string): void {
    this.emit(SOCKET_EVENTS.JOIN_SERVER, { serverId });
  }

  leaveServer(serverId: string): void {
    this.emit(SOCKET_EVENTS.LEAVE_SERVER, { serverId });
  }

  joinChannel(serverId: string, channelId: string): void {
    console.log(`🔍 EMIT join_channel: serverId=${serverId}, channelId=${channelId}`);
    this.emit(SOCKET_EVENTS.JOIN_CHANNEL, { serverId, channelId });
  }

  leaveChannel(serverId: string, channelId: string): void {
    console.log(`🔍 EMIT leave_channel: serverId=${serverId}, channelId=${channelId}`);
    this.emit(SOCKET_EVENTS.LEAVE_CHANNEL, { serverId, channelId });
  }

  sendTyping(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.TYPING, { serverId, channelId });
  }

  stopTyping(serverId: string, channelId: string): void {
    this.emit(SOCKET_EVENTS.STOP_TYPING, { serverId, channelId });
  }
}

export const socketService = new SocketService();