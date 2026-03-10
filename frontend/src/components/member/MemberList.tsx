'use client';

import React from 'react';
import { useMembers } from '@/hooks/useMembers';
import { MemberItem } from './MemberItem';
import { Spinner } from '@/components/ui/Spinner';

export function MemberList() {
  const { onlineMembers, offlineMembers, isLoading } = useMembers();

  if (isLoading) {
    return <Spinner centered />;
  }

  const total   = onlineMembers.length + offlineMembers.length;
  const isEmpty = total === 0;

  return (
    <div className="members-list">
      {/* EN LIGNE */}
      {onlineMembers.length > 0 && (
        <>
          <div className="members-section-label">
            En ligne — {onlineMembers.length}
          </div>
          {onlineMembers.map((member) => (
            <MemberItem key={member.userId} member={member} />
          ))}
        </>
      )}

      {/* HORS LIGNE */}
      {offlineMembers.length > 0 && (
        <>
          <div className="members-section-label" style={{ marginTop: '10px' }}>
            Hors ligne — {offlineMembers.length}
          </div>
          {offlineMembers.map((member) => (
            <MemberItem key={member.userId} member={member} dimmed />
          ))}
        </>
      )}

      {isEmpty && (
        <div className="members-empty">
          Aucun membre dans ce serveur.
        </div>
      )}
    </div>
  );
}