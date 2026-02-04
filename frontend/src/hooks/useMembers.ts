// useMembers Hook
import { useState, useEffect, useCallback } from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { memberService } from '@/services/api/member.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';

export function useMembers(serverId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load members for a server
   */
  const loadMembers = useCallback(async () => {
    if (!serverId) {
      setMembers([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await memberService.getByServerId(serverId);
      setMembers(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des membres');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Update a member's role
   */
  const updateMemberRole = useCallback(async (userId: string, role: MemberRole) => {
    if (!serverId) {
      throw new Error('No server selected');
    }

    try {
      setIsLoading(true);
      setError(null);
      const updatedMember = await memberService.updateRole(serverId, userId, { role });
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? updatedMember : m))
      );
      return updatedMember;
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du rôle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Kick a member
   */
  const kickMember = useCallback(async (userId: string) => {
    if (!serverId) {
      throw new Error('No server selected');
    }

    try {
      setIsLoading(true);
      setError(null);
      await memberService.kick(serverId, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err: any) {
      setError(err.message || "Échec de l'expulsion du membre");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Ban a member
   */
  const banMember = useCallback(async (userId: string, permanent: boolean = false) => {
    if (!serverId) {
      throw new Error('No server selected');
    }

    try {
      setIsLoading(true);
      setError(null);
      await memberService.ban(serverId, userId, permanent);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Échec du bannissement du membre');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  /**
   * Get online members count
   */
  const getOnlineCount = useCallback(() => {
    return members.filter((m) => m.isConnected).length;
  }, [members]);

  /**
   * Get member by ID
   */
  const getMemberById = useCallback((userId: string) => {
    return members.find((m) => m.id === userId);
  }, [members]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load members when server changes
  useEffect(() => {
    if (serverId) {
      loadMembers();
    } else {
      setMembers([]);
    }
  }, [serverId, loadMembers]);

  // Listen to real-time member events
  useEffect(() => {
    if (!serverId) return;

    const handleUserJoined = ({ serverId: sid, user }: { serverId: string; user: Member }) => {
      if (sid === serverId) {
        setMembers((prev) => {
          const exists = prev.find((m) => m.id === user.id);
          if (exists) {
            return prev.map((m) =>
              m.id === user.id ? { ...m, isConnected: true } : m
            );
          }
          return [...prev, { ...user, isConnected: true }];
        });
      }
    };

    const handleUserLeft = ({ serverId: sid, userId }: { serverId: string; userId: string }) => {
      if (sid === serverId) {
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, isConnected: false } : m))
        );
      }
    };

    const handleMemberRoleUpdated = ({ 
      serverId: sid, 
      userId, 
      role 
    }: { 
      serverId: string; 
      userId: string; 
      role: MemberRole 
    }) => {
      if (sid === serverId) {
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role } : m))
        );
      }
    };

    socketService.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socketService.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socketService.on(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleMemberRoleUpdated);

    return () => {
      socketService.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socketService.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socketService.off(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleMemberRoleUpdated);
    };
  }, [serverId]);

  return {
    members,
    isLoading,
    error,
    updateMemberRole,
    kickMember,
    banMember,
    getOnlineCount,
    getMemberById,
    refreshMembers: loadMembers,
    clearError,
  };
}