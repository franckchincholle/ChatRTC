// useMessages Hook
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message.types';
import { messageService } from '@/services/api/message.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';

export function useMessages(channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load messages for a channel
   */
  const loadMessages = useCallback(async () => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getByChannelId(channelId);
      setMessages(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des messages');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!channelId) {
      throw new Error('No channel selected');
    }

    try {
      setError(null);
      await messageService.send(channelId, { content });
      // Message will be added via socket event
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi du message");
      throw err;
    }
  }, [channelId]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await messageService.delete(messageId);
      // Message will be removed via socket event
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du message');
      throw err;
    }
  }, []);

  /**
   * Update a message
   */
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      setError(null);
      await messageService.update(messageId, { content });
      // Message will be updated via socket event
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du message');
      throw err;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (channelId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [channelId, loadMessages]);

  // Listen to real-time message events
  useEffect(() => {
    if (!channelId) return;

    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageUpdated = (message: Message) => {
      if (message.channelId === channelId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? message : m))
        );
      }
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string; channelId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socketService.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

    return () => {
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
      socketService.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    };
  }, [channelId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    updateMessage,
    refreshMessages: loadMessages,
    clearError,
  };
}