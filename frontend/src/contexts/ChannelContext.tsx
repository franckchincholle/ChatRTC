'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types/channel.types';
import { channelService } from '@/services/api/channel.service';
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

  // Recharger les channels quand le serveur sélectionné change
  useEffect(() => {
    if (selectedServer) {
      loadChannels(selectedServer.id);
    } else {
      setChannels([]);
      setSelectedChannel(null);
      localStorage.removeItem(SELECTED_CHANNEL_KEY);
    }
  }, [selectedServer?.id]);

  const loadChannels = useCallback(async (serverId?: string): Promise<void> => {
    const id = serverId ?? selectedServer?.id;
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await channelService.getByServerId(id);
      setChannels(data);

      // ✅ Restaurer le channel sélectionné depuis localStorage
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
      setChannels((prev) => [...prev, newChannel]);
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
      // ✅ Mise à jour immédiate de la liste
      setChannels((prev) => prev.map((c) => (c.id === id ? updatedChannel : c)));
      // ✅ Mise à jour du channel sélectionné si c'est celui-là
      setSelectedChannel((prev) => (prev?.id === id ? updatedChannel : prev));
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
      setChannels((prev) => prev.filter((c) => c.id !== id));
      setSelectedChannel((prev) => {
        if (prev?.id === id) {
          localStorage.removeItem(SELECTED_CHANNEL_KEY);
          return null;
        }
        return prev;
      });
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectChannel = useCallback((channel: Channel | null) => {
    setSelectedChannel(channel);
    // ✅ Persister le channel sélectionné pour le restaurer au refresh
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