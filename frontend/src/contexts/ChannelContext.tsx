'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types/channel.types';
import { channelService } from '@/services/api/channel.service';
import { useServersContext } from '@/contexts/ServerContext';

// ============================================
// TYPES
// ============================================

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

// ============================================
// CONTEXT
// ============================================

const ChannelContext = createContext<ChannelContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

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
      setChannels((prev) => prev.map((c) => (c.id === id ? updatedChannel : c)));
      if (selectedChannel?.id === id) setSelectedChannel(updatedChannel);
      return updatedChannel;
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel]);

  const deleteChannel = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await channelService.delete(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      if (selectedChannel?.id === id) setSelectedChannel(null);
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel]);

  const selectChannel = useCallback((channel: Channel | null) => {
    setSelectedChannel(channel);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        selectedChannel,
        isLoading,
        error,
        createChannel,
        updateChannel,
        deleteChannel,
        selectChannel,
        refreshChannels: () => loadChannels(),
        clearError,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

// ============================================
// HOOK INTERNE
// ============================================

export function useChannelsContext(): ChannelContextType {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannelsContext doit être utilisé dans un ChannelProvider');
  }
  return context;
}