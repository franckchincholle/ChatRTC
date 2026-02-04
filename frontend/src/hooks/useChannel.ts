// useChannels Hook
import { useState, useEffect, useCallback } from 'react';
import { Channel } from '@/types/channel.types';
import { channelService } from '@/services/api/channel.service';

export function useChannels(serverId: string | null) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load channels for a server
   */
  const loadChannels = useCallback(async () => {
    if (!serverId) {
      setChannels([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await channelService.getByServerId(serverId);
      setChannels(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des canaux');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Create a new channel
   */
  const createChannel = useCallback(async (name: string) => {
    if (!serverId) {
      throw new Error('No server selected');
    }

    try {
      setIsLoading(true);
      setError(null);
      const newChannel = await channelService.create(serverId, { name });
      setChannels((prev) => [...prev, newChannel]);
      return newChannel;
    } catch (err: any) {
      setError(err.message || 'Échec de la création du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Update a channel
   */
  const updateChannel = useCallback(async (id: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedChannel = await channelService.update(id, { name });
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? updatedChannel : c))
      );
      if (selectedChannel?.id === id) {
        setSelectedChannel(updatedChannel);
      }
      return updatedChannel;
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel]);

  /**
   * Delete a channel
   */
  const deleteChannel = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await channelService.delete(id);
      setChannels((prev) => prev.filter((c) => c.id !== id));
      if (selectedChannel?.id === id) {
        setSelectedChannel(null);
      }
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du canal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel]);

  /**
   * Select a channel
   */
  const selectChannel = useCallback((channel: Channel | null) => {
    setSelectedChannel(channel);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load channels when server changes
  useEffect(() => {
    if (serverId) {
      loadChannels();
    } else {
      setChannels([]);
      setSelectedChannel(null);
    }
  }, [serverId, loadChannels]);

  // Clear selected channel when it's deleted
  useEffect(() => {
    if (selectedChannel && !channels.find((c) => c.id === selectedChannel.id)) {
      setSelectedChannel(null);
    }
  }, [channels, selectedChannel]);

  return {
    channels,
    selectedChannel,
    isLoading,
    error,
    createChannel,
    updateChannel,
    deleteChannel,
    selectChannel,
    refreshChannels: loadChannels,
    clearError,
  };
}