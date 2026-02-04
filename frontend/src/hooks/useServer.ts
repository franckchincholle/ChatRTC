// useServers Hook
import { useState, useEffect, useCallback } from 'react';
import { Server } from '@/types/server.types';
import { serverService } from '@/services/api/server.service';

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all servers
   */
  const loadServers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await serverService.getAll();
      setServers(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des serveurs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new server
   */
  const createServer = useCallback(async (name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const newServer = await serverService.create({ name });
      setServers((prev) => [...prev, newServer]);
      return newServer;
    } catch (err: any) {
      setError(err.message || 'Échec de la création du serveur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a server
   */
  const updateServer = useCallback(async (id: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedServer = await serverService.update(id, { name });
      setServers((prev) =>
        prev.map((s) => (s.id === id ? updatedServer : s))
      );
      if (selectedServer?.id === id) {
        setSelectedServer(updatedServer);
      }
      return updatedServer;
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du serveur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  /**
   * Delete a server
   */
  const deleteServer = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await serverService.delete(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      if (selectedServer?.id === id) {
        setSelectedServer(null);
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du serveur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  /**
   * Join a server with invite code
   */
  const joinServer = useCallback(async (inviteCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const server = await serverService.join({ inviteCode });
      setServers((prev) => [...prev, server]);
      return server;
    } catch (err: any) {
      setError(err.message || 'Échec de rejoindre le serveur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Leave a server
   */
  const leaveServer = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await serverService.leave(id);
      setServers((prev) => prev.filter((s) => s.id !== id));
      if (selectedServer?.id === id) {
        setSelectedServer(null);
      }
    } catch (err: any) {
      setError(err.message || 'Échec de quitter le serveur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  /**
   * Generate invite code for a server
   */
  const generateInviteCode = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await serverService.generateInviteCode(id);
      return response.inviteCode;
    } catch (err: any) {
      setError(err.message || "Échec de la génération du code d'invitation");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Select a server
   */
  const selectServer = useCallback((server: Server | null) => {
    setSelectedServer(server);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load servers on mount
  useEffect(() => {
    loadServers();
  }, [loadServers]);

  return {
    servers,
    selectedServer,
    isLoading,
    error,
    createServer,
    updateServer,
    deleteServer,
    joinServer,
    leaveServer,
    generateInviteCode,
    selectServer,
    refreshServers: loadServers,
    clearError,
  };
}