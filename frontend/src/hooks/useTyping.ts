// useTyping Hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { TypingUser } from '@/types/socket.types';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { TYPING_TIMEOUT } from '@/utils/constants';

export function useTyping(
  serverId: string | null,
  channelId: string | null,
  currentUserId?: string
) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start typing indicator
   */
  const startTyping = useCallback(() => {
    if (!serverId || !channelId) return;

    // Send typing event to server
    socketService.sendTyping(serverId, channelId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after timeout
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_TIMEOUT);
  }, [serverId, channelId]);

  /**
   * Stop typing indicator
   */
  const stopTyping = useCallback(() => {
    if (!serverId || !channelId) return;

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send stop typing event to server
    socketService.stopTyping(serverId, channelId);
  }, [serverId, channelId]);

  /**
   * Get typing users as string
   */
  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return null;

    const names = typingUsers.map((u) => u.username);

    if (names.length === 1) {
      return `${names[0]} est en train d'écrire...`;
    } else if (names.length === 2) {
      return `${names[0]} et ${names[1]} sont en train d'écrire...`;
    } else {
      return `${names.slice(0, 2).join(', ')} et ${names.length - 2} autre${
        names.length - 2 > 1 ? 's' : ''
      } sont en train d'écrire...`;
    }
  }, [typingUsers]);

  // Listen to typing events
  useEffect(() => {
    if (!serverId || !channelId) {
      setTypingUsers([]);
      return;
    }

    const handleUserTyping = ({
      serverId: sid,
      channelId: cid,
      user,
    }: {
      serverId: string;
      channelId: string;
      user: TypingUser;
    }) => {
      if (sid === serverId && cid === channelId && user.userId !== currentUserId) {
        setTypingUsers((prev) => {
          // Check if user is already typing
          if (prev.find((u) => u.userId === user.userId)) {
            return prev;
          }
          return [...prev, user];
        });

        // Auto-remove after timeout
        setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== user.userId)
          );
        }, TYPING_TIMEOUT);
      }
    };

    const handleUserStopTyping = ({
      serverId: sid,
      channelId: cid,
      userId,
    }: {
      serverId: string;
      channelId: string;
      userId: string;
    }) => {
      if (sid === serverId && cid === channelId) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }
    };

    socketService.on(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
    socketService.on(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);

    return () => {
      socketService.off(SOCKET_EVENTS.USER_TYPING, handleUserTyping);
      socketService.off(SOCKET_EVENTS.USER_STOP_TYPING, handleUserStopTyping);

      // Clear timeout on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [serverId, channelId, currentUserId]);

  // Clear typing users when channel changes
  useEffect(() => {
    setTypingUsers([]);
  }, [channelId]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    getTypingText,
    isTyping: typingUsers.length > 0,
  };
}