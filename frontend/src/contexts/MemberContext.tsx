'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { memberService, BanDuration } from '@/services/api/member.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useServersContext } from '@/contexts/ServerContext';
import { useAuth } from '@/contexts/AuthContext';

interface MemberContextType {
  members: Member[];
  onlineCount: number;
  totalCount: number;
  onlineMembers: Member[];
  offlineMembers: Member[];
  isLoading: boolean;
  error: string | null;
  updateMemberRole: (userId: string, role: MemberRole) => Promise<void>;
  kickMember: (userId: string) => Promise<void>;
  banMember: (userId: string, duration: BanDuration) => Promise<void>;
  unbanMember: (userId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
  clearError: () => void;
}

const MemberContext = createContext<MemberContextType | null>(null);

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedServer } = useServersContext();
  const { user: _user } = useAuth();

  useEffect(() => {
    if (selectedServer) loadMembers(selectedServer.id);
    else setMembers([]);
  }, [selectedServer?.id]);

  useEffect(() => {
    if (!selectedServer) return;

    const handleStatusChanged = (data: unknown) => {
      const { userId, status } = data as { userId: string; status: 'online' | 'offline' };
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, isOnline: status === 'online' } : m));
    };

    const handleMemberJoined = (data: unknown) => {
      const { serverId } = data as { userId: string; serverId: string };
      if (serverId !== selectedServer.id) return;
      loadMembers(selectedServer.id);
    };

    const handleMemberLeft = (data: unknown) => {
      const { userId, serverId } = data as { userId: string; serverId: string };
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    };

    const handleRoleUpdated = (data: unknown) => {
      const { userId, serverId, role } = data as { userId: string; serverId: string; role: MemberRole };
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role } : m));
    };

    const handleMemberKicked = (data: unknown) => {
      const { userId, serverId } = data as { userId: string; serverId: string };
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    };

    const handleMemberBanned = (data: unknown) => {
      const { userId, serverId } = data as { userId: string; serverId: string };
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, isBanned: true } : m));
    };

    const handleMemberUnbanned = (data: unknown) => {
      const { userId, serverId } = data as { userId: string; serverId: string };
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, isBanned: false } : m));
    };

    socketService.on(SOCKET_EVENTS.USER_STATUS_CHANGED, handleStatusChanged);
    socketService.on(SOCKET_EVENTS.SERVER_MEMBER_JOINED, handleMemberJoined);
    socketService.on(SOCKET_EVENTS.SERVER_MEMBER_LEFT, handleMemberLeft);
    socketService.on(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleRoleUpdated);
    socketService.on(SOCKET_EVENTS.MEMBER_KICKED, handleMemberKicked);
    socketService.on(SOCKET_EVENTS.MEMBER_BANNED, handleMemberBanned);
    socketService.on(SOCKET_EVENTS.MEMBER_UNBANNED, handleMemberUnbanned);

    return () => {
      socketService.off(SOCKET_EVENTS.USER_STATUS_CHANGED, handleStatusChanged);
      socketService.off(SOCKET_EVENTS.SERVER_MEMBER_JOINED, handleMemberJoined);
      socketService.off(SOCKET_EVENTS.SERVER_MEMBER_LEFT, handleMemberLeft);
      socketService.off(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleRoleUpdated);
      socketService.off(SOCKET_EVENTS.MEMBER_KICKED, handleMemberKicked);
      socketService.off(SOCKET_EVENTS.MEMBER_BANNED, handleMemberBanned);
      socketService.off(SOCKET_EVENTS.MEMBER_UNBANNED, handleMemberUnbanned);
    };
  }, [selectedServer?.id]);

  const loadMembers = useCallback(async (serverId?: string): Promise<void> => {
    const id = serverId ?? selectedServer?.id;
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await memberService.getByServerId(id);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du chargement des membres");
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer?.id]);

  const updateMemberRole = useCallback(async (userId: string, role: MemberRole): Promise<void> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setError(null);
      await memberService.updateRole(selectedServer.id, userId, { role });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la mise à jour du rôle");
      throw err;
    }
  }, [selectedServer]);

  const kickMember = useCallback(async (userId: string): Promise<void> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setError(null);
      await memberService.kick(selectedServer.id, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du kick");
      throw err;
    }
  }, [selectedServer]);

  const banMember = useCallback(async (userId: string, duration: BanDuration): Promise<void> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setError(null);
      await memberService.ban(selectedServer.id, userId, duration);
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, isBanned: true } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du ban");
      throw err;
    }
  }, [selectedServer]);

  const unbanMember = useCallback(async (userId: string): Promise<void> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setError(null);
      await memberService.unban(selectedServer.id, userId);
      setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, isBanned: false } : m));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du unban");
      throw err;
    }
  }, [selectedServer]);

  const clearError = useCallback(() => setError(null), []);

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    if (roleOrder[a.role] !== roleOrder[b.role]) return roleOrder[a.role] - roleOrder[b.role];
    return Number(b.isOnline) - Number(a.isOnline);
  });

  const onlineMembers  = sortedMembers.filter((m) => m.isOnline);
  const offlineMembers = sortedMembers.filter((m) => !m.isOnline);

  return (
    <MemberContext.Provider value={{
      members: sortedMembers,
      onlineCount: onlineMembers.length,
      totalCount: members.length,
      onlineMembers, offlineMembers,
      isLoading, error,
      updateMemberRole, kickMember, banMember, unbanMember,
      refreshMembers: () => loadMembers(),
      clearError,
    }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMembersContext(): MemberContextType {
  const context = useContext(MemberContext);
  if (!context) throw new Error('useMembersContext doit être utilisé dans un MemberProvider');
  return context;
}