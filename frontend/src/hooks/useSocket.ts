import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket/socket.service';
import { storage } from '@/utils/storage';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);

  const connect = useCallback(() => {
    const token = storage.getToken();
    if (!token) {
      console.warn('No token found, cannot connect to socket');
      return;
    }

    socketService.connect(token);
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketService.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketService.off(event, callback);
  }, []);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.connected);
      setSocketId(socketService.id);
    };

    checkConnection();

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
    joinServer: socketService.joinServer.bind(socketService),
    leaveServer: socketService.leaveServer.bind(socketService),
    joinChannel: socketService.joinChannel.bind(socketService),
    leaveChannel: socketService.leaveChannel.bind(socketService),
    sendTyping: socketService.sendTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
  };
}