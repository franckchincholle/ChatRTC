import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { TYPING_TIMEOUT } from '@/utils/constants';

interface TypingUser {
  userId: string;
  username: string;
}

export function useTyping(
  serverId: string | null,
  channelId: string | null,
  currentUserId?: string
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!serverId || !channelId) return;
    socketService.sendTyping(serverId, channelId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), TYPING_TIMEOUT);
  }, [serverId, channelId]);

  const stopTyping = useCallback(() => {
    if (!serverId || !channelId) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketService.stopTyping(serverId, channelId);
  }, [serverId, channelId]);

  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return null;
    const names = typingUsers.map((u) => u.username);
    if (names.length === 1) return `${names[0]} est en train d'écrire...`;
    if (names.length === 2) return `${names[0]} et ${names[1]} sont en train d'écrire...`;
    return `${names.slice(0, 2).join(', ')} et ${names.length - 2} autre${names.length - 2 > 1 ? 's' : ''} sont en train d'écrire...`;
  }, [typingUsers]);

  useEffect(() => {
    if (!serverId || !channelId) {
      setTypingUsers([]);
      return;
    }

    const handleUserTyping = (data: unknown) => {
      const { serverId: sid, channelId: cid, user } = data as {
        serverId: string;
        channelId: string;
        user: TypingUser;
      };

      if (sid !== serverId || cid !== channelId) return;
      if (user.userId === currentUserId) return; 

      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === user.userId)) return prev;
        return [...prev, user];
      });

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      }, TYPING_TIMEOUT);
    };

    const handleUserStopTyping = (data: unknown) => {
      const { serverId: sid, channelId: cid, userId } = data as {
        serverId: string;
        channelId: string;
        userId: string;
      };

      if (sid !== serverId || cid !== channelId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socketService.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socketService.on(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);

    return () => {
      socketService.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socketService.off(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [serverId, channelId, currentUserId]);

  useEffect(() => {
    setTypingUsers([]);
  }, [channelId]);

  return { typingUsers, startTyping, stopTyping, getTypingText, isTyping: typingUsers.length > 0 };
}