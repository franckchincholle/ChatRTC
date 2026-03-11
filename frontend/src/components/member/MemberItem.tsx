'use client';

import React, { useState } from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/hooks/useAuth';
import { UpdateMemberModal } from './UpdateMemberModal';

interface MemberItemProps {
  member: Member;
  dimmed?: boolean;
}

const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Admin',
  MEMBER: 'Membre',
};

const PALETTES = [
  { bg: '#1a1a2e', color: '#818cf8' },
  { bg: '#1a2a1a', color: '#4ade80' },
  { bg: '#2a1a1a', color: '#f87171' },
  { bg: '#1a2a2a', color: '#22d3ee' },
  { bg: '#2a2a1a', color: '#facc15' },
  { bg: '#2a1a2a', color: '#e879f9' },
];

function getPalette(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTES[Math.abs(hash) % PALETTES.length];
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function MemberItem({ member, dimmed = false }: MemberItemProps) {
  const { user }                      = useAuth();
  const { members }                   = useMembers();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const currentUser   = members.find((m) => m.userId === user?.id);
  const canManage     = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';
  const isSelf        = member.userId === user?.id;
  const canChangeRole = canManage && !isSelf && member.role !== 'OWNER';

  const palette = getPalette(member.username);

  return (
    <>
      <div className={`member-item${dimmed ? ' member-dimmed' : ''}`}>
        {/* Avatar */}
        <div
          className="member-avatar"
          style={{ background: palette.bg, color: palette.color }}
          aria-hidden="true"
        >
          {getInitials(member.username)}
          <span className={`member-status ${member.isOnline ? 'online' : 'offline'}`} />
        </div>

        {/* Infos */}
        <div className="member-info">
          <span className="member-name">
            {member.username}
            {isSelf && <span className="member-self-tag"> vous</span>}
          </span>
          <span className={`member-role member-role-${member.role.toLowerCase()}`}>
            {ROLE_LABELS[member.role]}
          </span>
        </div>

        {/* Icône édition rôle */}
        {canChangeRole && (
          <button
            className="member-edit-btn"
            onClick={() => setShowRoleModal(true)}
            title="Modifier le rôle"
            aria-label={`Modifier le rôle de ${member.username}`}
          >
            ✎
          </button>
        )}
      </div>

      {/* Modale de modification de rôle */}
      {canChangeRole && (
        <UpdateMemberModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          member={member}
        />
      )}
    </>
  );
}