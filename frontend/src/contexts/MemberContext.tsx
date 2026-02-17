'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { memberService } from '@/services/api/member.service';
import { socketService } from '@/services/socket/socket.service';
import { SOCKET_EVENTS } from '@/services/socket/events';
import { useServersContext } from '@/contexts/ServerContext';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// TYPES
// ============================================

interface MemberContextType {
  members: Member[];
  onlineCount: number;
  totalCount: number;
  onlineMembers: Member[];
  offlineMembers: Member[];
  isLoading: boolean;
  error: string | null;
  updateMemberRole: (userId: string, role: MemberRole) => Promise<void>;
  refreshMembers: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// CONTEXT
// ============================================

const MemberContext = createContext<MemberContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedServer } = useServersContext();
  const { user } = useAuth();

  // Charger les membres quand le serveur change
  useEffect(() => {
    if (selectedServer) {
      loadMembers(selectedServer.id);
    } else {
      setMembers([]);
    }
  }, [selectedServer?.id]);

  // ============================================
  // ÉCOUTER LES ÉVÉNEMENTS SOCKET.IO
  // ============================================
  useEffect(() => {
    if (!selectedServer) return;

    // Statut online/offline d'un membre
    const handleStatusChanged = ({ userId, status }: { 
      userId: string; 
      status: 'online' | 'offline' 
    }) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId
            ? { ...m, isOnline: status === 'online' }
            : m
        )
      );
    };

    // Nouveau membre rejoint le serveur
    const handleMemberJoined = ({ userId, serverId }: { 
      userId: string; 
      serverId: string 
    }) => {
      if (serverId !== selectedServer.id) return;
      // Recharger la liste complète pour avoir les infos du nouveau membre
      loadMembers(selectedServer.id);
    };

    // Membre quitte le serveur
    const handleMemberLeft = ({ userId, serverId }: { 
      userId: string; 
      serverId: string 
    }) => {
      if (serverId !== selectedServer.id) return;
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    };

    // Rôle mis à jour
    const handleRoleUpdated = ({ userId, serverId, role }: { 
      userId: string; 
      serverId: string; 
      role: MemberRole 
    }) => {
      if (serverId !== selectedServer.id) return;
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m))
      );
    };

    socketService.on(SOCKET_EVENTS.USER_STATUS_CHANGED, handleStatusChanged);
    socketService.on(SOCKET_EVENTS.SERVER_MEMBER_JOINED, handleMemberJoined);
    socketService.on(SOCKET_EVENTS.SERVER_MEMBER_LEFT, handleMemberLeft);
    socketService.on(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleRoleUpdated);

    return () => {
      socketService.off(SOCKET_EVENTS.USER_STATUS_CHANGED, handleStatusChanged);
      socketService.off(SOCKET_EVENTS.SERVER_MEMBER_JOINED, handleMemberJoined);
      socketService.off(SOCKET_EVENTS.SERVER_MEMBER_LEFT, handleMemberLeft);
      socketService.off(SOCKET_EVENTS.MEMBER_ROLE_UPDATED, handleRoleUpdated);
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
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des membres');
    } finally {
      setIsLoading(false);
    }
  }, [selectedServer?.id]);

  const updateMemberRole = useCallback(async (
    userId: string, 
    role: MemberRole
  ): Promise<void> => {
    if (!selectedServer) throw new Error('Aucun serveur sélectionné');
    try {
      setError(null);
      await memberService.updateRole(selectedServer.id, userId, { role });
      // La mise à jour viendra via Socket.IO MEMBER_ROLE_UPDATED
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du rôle');
      throw err;
    }
  }, [selectedServer]);

  const clearError = useCallback(() => setError(null), []);

  // Membres triés : OWNER → ADMIN → MEMBER, puis online avant offline
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    // À rôle égal, online en premier
    return Number(b.isOnline) - Number(a.isOnline);
  });

  const onlineMembers = sortedMembers.filter((m) => m.isOnline);
  const offlineMembers = sortedMembers.filter((m) => !m.isOnline);

  return (
    <MemberContext.Provider value={{
      members: sortedMembers,
      onlineCount: onlineMembers.length,
      totalCount: members.length,
      onlineMembers,
      offlineMembers,
      isLoading,
      error,
      updateMemberRole,
      refreshMembers: () => loadMembers(),
      clearError,
    }}>
      {children}
    </MemberContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useMembersContext(): MemberContextType {
  const context = useContext(MemberContext);
  if (!context) throw new Error('useMembersContext doit être utilisé dans un MemberProvider');
  return context;
}