// useSocket Hook
import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket/socket.service';
import { storage } from '@/utils/storage';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    const token = storage.getToken();
    if (!token) {
      console.warn('No token found, cannot connect to socket');
      return;
    }

    socketService.connect(token);
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  /**
   * Emit an event
   */
  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  /**
   * Listen to an event
   */
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketService.on(event, callback);
  }, []);

  /**
   * Stop listening to an event
   */
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketService.off(event, callback);
  }, []);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.connected);
      setSocketId(socketService.id);
    };

    // Initial check
    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    isConnected,
    socketId,
    connect,
    disconnect,
    emit,
    on,
    off,
    // Specific methods from socketService
    joinServer: socketService.joinServer.bind(socketService),
    leaveServer: socketService.leaveServer.bind(socketService),
    joinChannel: socketService.joinChannel.bind(socketService),
    leaveChannel: socketService.leaveChannel.bind(socketService),
    sendTyping: socketService.sendTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
  };
}