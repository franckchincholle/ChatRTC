'use client';

import React from 'react';
import { useMembers } from '@/hooks/useMembers';
import { useServers } from '@/hooks/useServer';
import { MemberItem } from './MemberItem';

export function MemberList() {
  const { selectedServer } = useServers();
  const { members, getOnlineCount } = useMembers(selectedServer?.id || null);

  if (!selectedServer) return null;

  return (
    <div className="members-sidebar">
      <div className="members-sidebar-header">
        <h3 className="members-sidebar-title">
          Membres ({members.length}) - {getOnlineCount()} en ligne
        </h3>
      </div>
      <div className="members-list">
        {members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}