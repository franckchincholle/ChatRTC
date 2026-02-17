'use client';

import React from 'react';
import { useMembers } from '@/hooks/useMembers';
import { MemberItem } from './MemberItem';

export function MemberList() {
  const { 
    onlineMembers, 
    offlineMembers, 
    onlineCount, 
    totalCount,
    isLoading
  } = useMembers();

  if (isLoading) return <div className="members-sidebar">Chargement...</div>;

  return (
    <div className="members-sidebar">
      <div className="members-sidebar-header">
        <h3 className="members-sidebar-title">
          Membres — {onlineCount}/{totalCount} en ligne
        </h3>
      </div>

      {/* Membres en ligne */}
      {onlineMembers.length > 0 && (
        <div className="members-group">
          <div className="members-group-title">
            EN LIGNE — {onlineMembers.length}
          </div>
          {onlineMembers.map((member) => (
            <MemberItem key={member.userId} member={member} />
          ))}
        </div>
      )}

      {/* Membres hors ligne */}
      {offlineMembers.length > 0 && (
        <div className="members-group">
          <div className="members-group-title">
            HORS LIGNE — {offlineMembers.length}
          </div>
          {offlineMembers.map((member) => (
            <MemberItem key={member.userId} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}