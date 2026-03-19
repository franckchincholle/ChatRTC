'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Server, ServerMember } from '@/types/server.types';
import { serverService } from '@/services/api/server.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useAuth } from '@/contexts/AuthContext';

interface ServerContextType {
  servers: Server[];
  selectedServer: Server | null;
  isLoading: boolean;
  error: string | null;
  createServer: (name: string) => Promise<Server>;
  updateServer: (id: string, name: string) => Promise<Server>;
  deleteServer: (id: string) => Promise<void>;
  joinServer: (inviteCode: string) => Promise<ServerMember>;
  leaveServer: (id: string) => Promise<void>;
  generateInviteCode: (id: string) => Promise<string>;
  selectServer: (server: Server | null) => void;
  refreshServers: () => Promise<void>;
  clearError: () => void;
}

const ServerContext = createContext<ServerContextType | null>(null);

export function ServerProvider({ children }: { children: React.ReactNode }) {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) loadServers();
    else {
      setServers([]);
      setSelectedServer(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKickedOrBanned = (data: unknown) => {
      const { userId, serverId } = data as { userId: string; serverId: string };
      if (userId !== user?.id) return;
      setServers((prev) => prev.filter((s) => s.id !== serverId));
      setSelectedServer((prev) => prev?.id === serverId ? null : prev);
      socketService.leaveServer(serverId);
    };

    const handleUnbanned = (data: unknown) => {
      const { userId } = data as { userId: string };
      if (userId !== user?.id) return;
      loadServers();
    };

    socketService.on(SOCKET_EVENTS.MEMBER_KICKED, handleKickedOrBanned);
    socketService.on(SOCKET_EVENTS.MEMBER_BANNED, handleKickedOrBanned);
    socketService.on(SOCKET_EVENTS.MEMBER_UNBANNED, handleUnbanned);

    return () => {
      socketService.off(SOCKET_EVENTS.MEMBER_KICKED, handleKickedOrBanned);
      socketService.off(SOCKET_EVENTS.MEMBER_BANNED, handleKickedOrBanned);
      socketService.off(SOCKET_EVENTS.MEMBER_UNBANNED, handleUnbanned);
    };
  }, [user?.id]);

  const loadServers = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await serverService.getAll();
      setServers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement des serveurs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createServer = useCallback(async (name: string): Promise<Server> => {
    try {
      setIsLoading(true);
      setError(null);
      const newServer = await serverService.create({ name });
      setServers((prev) => [...prev, newServer]);
      return newServer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la création du serveur");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateServer = useCallback(async (id: string, name: string): Promise<Server> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedServer = await serverService.update(id, { name });
      setServers((prev) => prev.map((s) => s.id === id ? updatedServer : s));
      if (selectedServer?.id === id) setSelectedServer(updatedServer);
      return updatedServer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la mise à jour du serveur");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  const deleteServer = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await serverService.delete(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      if (selectedServer?.id === id) setSelectedServer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la suppression du serveur");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  const joinServer = useCallback(async (inviteCode: string): Promise<ServerMember> => {
    try {
      setIsLoading(true);
      setError(null);
      const member = await serverService.join({ inviteCode });
      await loadServers();
      return member;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec, vous n'avez pas pu rejoindre le serveur");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadServers]);

  const leaveServer = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await serverService.leave(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      if (selectedServer?.id === id) setSelectedServer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec, vous n'avez pas pu quitter le serveur");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  const generateInviteCode = useCallback(async (id: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await serverService.generateInviteCode(id);
      return response.code;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la génération du code d'invitation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectServer = useCallback((server: Server | null) => {
    if (selectedServer) socketService.leaveServer(selectedServer.id);
    setSelectedServer(server);
    if (server) socketService.joinServer(server.id);
  }, [selectedServer]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ServerContext.Provider value={{
      servers, selectedServer, isLoading, error,
      createServer, updateServer, deleteServer,
      joinServer, leaveServer, generateInviteCode,
      selectServer, refreshServers: loadServers, clearError,
    }}>
      {children}
    </ServerContext.Provider>
  );
}

export function useServersContext(): ServerContextType {
  const context = useContext(ServerContext);
  if (!context) throw new Error('useServersContext doit être utilisé dans un ServerProvider');
  return context;
}