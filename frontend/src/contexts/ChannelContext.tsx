'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types/channel.types';
import { channelService } from '@/services/api/channel.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useServersContext } from '@/contexts/ServerContext';

const SELECTED_CHANNEL_KEY = 'selected_channel';

interface ChannelContextType {
  channels: Channel[];
  selectedChannel: Channel | null;
  isLoading: boolean;
  error: string | null;
  createChannel: (name: string) => Promise<Channel>;
  updateChannel: (id: string, name: string) => Promise<Channel>;
  deleteChannel: (id: string) => Promise<void>;
  selectChannel: (channel: Channel | null) => void;
  refreshChannels: () => Promise<void>;
  clearError: () => void;
}

const ChannelContext = createContext<ChannelContextType | null>(null);

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedServer } = useServersContext();

  // Charger les channels quand le serveur change
  useEffect(() => {
    if (selectedServer) {
      loadChannels(selectedServer.id);
    } else {
      setChannels([]);
      setSelectedChannel(null);
      localStorage.removeItem(SELECTED_CHANNEL_KEY);
    }
  }, [selectedServer?.id]);

  // ============================================
  // ✅ ÉCOUTER LES ÉVÉNEMENTS SOCKET.IO
  // ============================================
  useEffect(() => {
    if (!selectedServer) return;

    // Channel créé par quelqu'un d'autre
    const handleChannelCreated = (channel: Channel) => {
      console.log('🆕 Channel créé via Socket:', channel.name);
      // Vérifier que le channel appartient au serveur sélectionné
      if (channel.serverId === selectedServer.id) {
        setChannels((prev) => {
          // Éviter les doublons si c'est nous qui l'avons créé
          const exists = prev.find((c) => c.id === channel.id);
          if (exists) return prev;
          return [...prev, channel];
        });
      }
    };

    // Channel mis à jour
    const handleChannelUpdated = (channel: Channel) => {
      console.log('✏️ Channel mis à jour via Socket:', channel.name);
      if (channel.serverId === selectedServer.id) {
        setChannels((prev) =>
          prev.map((c) => (c.id === channel.id ? channel : c))
        );
        // Mettre à jour selectedChannel si c'est celui qui est ouvert
        setSelectedChannel((prev) =>
          prev?.id === channel.id ? channel : prev
        );
      }
    };

    // Channel supprimé
    const handleChannelDeleted = ({ channelId, serverId }: { channelId: string; serverId: string }) => {
      console.log('🗑️ Channel supprimé via Socket:', channelId);
      if (serverId === selectedServer.id) {
        setChannels((prev) => prev.filter((c) => c.id !== channelId));
        setSelectedChannel((prev) => {
          if (prev?.id === channelId) {
            localStorage.removeItem(SELECTED_CHANNEL_KEY);
            return null;
          }
          return prev;
        });
      }
    };

    socketService.on(SOCKET_EVENTS.CHANNEL_CREATED, handleChannelCreated);
    socketService.on(SOCKET_EVENTS.CHANNEL_UPDATED, handleChannelUpdated);
    socketService.on(SOCKET_EVENTS.CHANNEL_DELETED, handleChannelDeleted);

    return () => {
      socketService.off(SOCKET_EVENTS.CHANNEL_CREATED, handleChannelCreated);
      socketService.off(SOCKET_EVENTS.CHANNEL_UPDATED, handleChannelUpdated);
      socketService.off(SOCKET_EVENTS.CHANNEL_DELETED, handleChannelDeleted);
    };
  }, [selectedServer?.id]);

  const loadChannels = useCallback(async (serverId?: string): Promise<void> => {
    const id = serverId ?? selectedServer?.id;
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await channelService.getByServerId(id);
      setChannels(data);

      const savedChannelId = localStorage.getItem(SELECTED_CHANNEL_KEY);
      if (savedChannelId) {
        const savedChannel = data.find((c) => c.id === savedChannelId);
        if (savedChannel) {
          setSelectedChannel(savedChannel);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des canaux');
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer?.id]);

  const createChannel = useCallback(async (name: string): Promise<Channel> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setIsLoading(true);
      setError(null);
      const newChannel = await channelService.create(selectedServer.id, { name });
      // ✅ Ne pas ajouter ici : Socket.IO va recevoir channel:created
      // et handleChannelCreated vérifiera les doublons
      return newChannel;
    } catch (err: any) {
      setError(err.message || 'Échec de la création du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer]);

  const updateChannel = useCallback(async (id: string, name: string): Promise<Channel> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedChannel = await channelService.update(id, { name });
      // ✅ Ne pas mettre à jour ici : Socket.IO va recevoir channel:updated
      return updatedChannel;
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChannel = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await channelService.delete(id);
      // ✅ Ne pas supprimer ici : Socket.IO va recevoir channel:deleted
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectChannel = useCallback((channel: Channel | null) => {
    setSelectedChannel(channel);
    if (channel) {
      localStorage.setItem(SELECTED_CHANNEL_KEY, channel.id);
    } else {
      localStorage.removeItem(SELECTED_CHANNEL_KEY);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChannelContext.Provider value={{
      channels, selectedChannel, isLoading, error,
      createChannel, updateChannel, deleteChannel,
      selectChannel, refreshChannels: () => loadChannels(), clearError,
    }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannelsContext(): ChannelContextType {
  const context = useContext(ChannelContext);
  if (!context) throw new Error('useChannelsContext doit être utilisé dans un ChannelProvider');
  return context;
}