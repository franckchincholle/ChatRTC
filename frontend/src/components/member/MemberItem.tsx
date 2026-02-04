'use client';

import React from 'react';
import { Member } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { MemberRoleSelect } from './MemberRoleSelect';

interface MemberItemProps {
  member: Member;
}

export function MemberItem({ member }: MemberItemProps) {
  const { user } = useAuth();
  const { selectedServer } = useServers();
  const { members } = useMembers(selectedServer?.id || null);

  const currentUserRole = members.find(m => m.id === user?.id)?.role;
  const isOwner = currentUserRole === 'owner';
  const isSelf = member.id === user?.id;

  return (
    <div className="member-item">
      <div className="member-info">
        <span className={member.isConnected ? 'online-indicator' : 'offline-indicator'}>
          ●
        </span>
        <span className="member-name">{member.username}</span>
        <span className="member-role">({member.role})</span>
      </div>
      {isOwner && !isSelf && (
        <MemberRoleSelect 
          memberId={member.id} 
          currentRole={member.role} 
        />
      )}
    </div>
  );
}