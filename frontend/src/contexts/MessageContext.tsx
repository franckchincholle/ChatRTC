'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message.types';
import { messageService } from '@/services/api/message.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useChannelsContext } from '@/contexts/ChannelContext';

// ============================================
// TYPES
// ============================================

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// CONTEXT
// ============================================

const MessageContext = createContext<MessageContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedChannel } = useChannelsContext();

  // Recharger les messages quand le channel sélectionné change
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    } else {
      setMessages([]);
    }
  }, [selectedChannel?.id]);

  // Écouter les événements Socket.IO en temps réel
  useEffect(() => {
    if (!selectedChannel) return;

    const handleNewMessage = (message: Message) => {
      if (message.channelId === selectedChannel.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

    return () => {
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    };
  }, [selectedChannel?.id]);

  const loadMessages = useCallback(async (channelId?: string): Promise<void> => {
    const id = channelId ?? selectedChannel?.id;
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getByChannelId(id);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des messages');
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel?.id]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');

    try {
      setError(null);
      await messageService.send(selectedChannel.id, { content });
      // Le message sera ajouté via l'événement Socket.IO NEW_MESSAGE
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi du message");
      throw err;
    }
  }, [selectedChannel]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');

    try {
      setError(null);
      await messageService.delete(selectedChannel.id, messageId);
      // Le message sera retiré via l'événement Socket.IO MESSAGE_DELETED
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du message');
      throw err;
    }
  }, [selectedChannel]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <MessageContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        deleteMessage,
        refreshMessages: () => loadMessages(),
        clearError,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

// ============================================
// HOOK INTERNE
// ============================================

export function useMessagesContext(): MessageContextType {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessagesContext doit être utilisé dans un MessageProvider');
  }
  return context;
}