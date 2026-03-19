'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Message, Reaction } from '@/types/message.types';
import { messageService } from '@/services/api/message.service';
import { reactionService } from '@/services/api/reaction.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useChannelsContext } from '@/contexts/ChannelContext';
import { useServersContext } from '@/contexts/ServerContext';

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
  clearError: () => void;
}

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { selectedChannel } = useChannelsContext();
  const { selectedServer } = useServersContext();

  useEffect(() => {
    if (!selectedChannel || !selectedServer) return;

    const joinWhenReady = () => {
      if (socketService.connected) {
        console.log(`📺 JOIN channel: ${selectedChannel.name}`);
        socketService.joinChannel(selectedServer.id, selectedChannel.id);
      } else {
        console.log('⏳ Socket pas encore connecté, retry dans 500ms...');
        setTimeout(joinWhenReady, 500);
      }
    };

    joinWhenReady();

    return () => {
      console.log('🔍 LEAVE CHANNEL EFFECT:');
      console.log('  - leaving channel:', selectedChannel.id, selectedChannel.name);
      socketService.leaveChannel(selectedServer.id, selectedChannel.id);
    };
  }, [selectedChannel?.id, selectedServer?.id]);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    } else {
      setMessages([]);
    }
  }, [selectedChannel?.id]);

  useEffect(() => {
    if (!selectedChannel) return;

    const handleNewMessage = (data: unknown) => {
      const message = data as Message;
      setMessages((prev) => [...prev, { ...message, reactions: message.reactions ?? [] }]);
    };

    const handleMessageUpdated = (data: unknown) => {
      const { message } = data as { message: Message; channelId: string };
      setMessages((prev) => prev.map((m) => m.id === message.id ? { ...message, reactions: m.reactions } : m));
    };

    const handleMessageDeleted = (data: unknown) => {
      const { messageId } = data as { messageId: string };
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    const handleReactionAdded = (data: unknown) => {
      const reaction = data as Reaction & { channelId: string };
      setMessages((prev) => prev.map((m) => {
        if (m.id !== reaction.messageId) return m;
        const others = m.reactions.filter((r) => r.userId !== reaction.userId);
        return { ...m, reactions: [...others, { messageId: reaction.messageId, userId: reaction.userId, emoji: reaction.emoji }] };
      }));
    };
 
    const handleReactionRemoved = (data: unknown) => {
      const reaction = data as Reaction & { channelId: string };
      setMessages((prev) => prev.map((m) => {
        if (m.id !== reaction.messageId) return m;
        return { ...m, reactions: m.reactions.filter((r) => r.userId !== reaction.userId) };
      }));
    };

    socketService.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socketService.on(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
    socketService.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
    socketService.on(SOCKET_EVENTS.REACTION_ADDED,  handleReactionAdded);
    socketService.on(SOCKET_EVENTS.REACTION_REMOVED, handleReactionRemoved);

    return () => {
      socketService.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socketService.off(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
      socketService.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);
      socketService.off(SOCKET_EVENTS.REACTION_ADDED,  handleReactionAdded);
      socketService.off(SOCKET_EVENTS.REACTION_REMOVED, handleReactionRemoved);
    };
  }, [selectedChannel?.id]);

  const loadMessages = useCallback(async (channelId?: string): Promise<void> => {
    const id = channelId ?? selectedChannel?.id;
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await messageService.getByChannelId(id);
      setMessages(data.map((m) => ({ ...m, reactions: m.reactions ?? [] })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement des messages");
    } finally {
      setIsLoading(false);
    }
  }, [selectedChannel?.id]);

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');
    try {
      setError(null);
      await messageService.send(selectedChannel.id, { content });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi du message");
      throw err;
    }
  }, [selectedChannel]);

  const updateMessage = useCallback(async (messageId: string, content: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');
    try {
      setError(null);
      await messageService.update(selectedChannel.id, messageId, { content });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la modification du message");
      throw err;
    }
  }, [selectedChannel]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');
    try {
      setError(null);
      await messageService.delete(selectedChannel.id, messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la suppression du message");
      throw err;
    }
  }, [selectedChannel]);

  const toggleReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!selectedChannel) throw new Error('Aucun canal sélectionné');
    try {
      setError(null);
      await reactionService.toggle(selectedChannel.id, messageId, { emoji });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la réaction");
      throw err;
    }
  }, [selectedChannel]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <MessageContext.Provider value={{
      messages, isLoading, error,
      sendMessage, updateMessage, deleteMessage, toggleReaction,
      refreshMessages: () => loadMessages(),
      clearError,
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessagesContext(): MessageContextType {
  const context = useContext(MessageContext);
  if (!context) throw new Error('useMessagesContext doit être utilisé dans un MessageProvider');
  return context;
}