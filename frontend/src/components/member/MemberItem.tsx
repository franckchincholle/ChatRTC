'use client';

import React from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/hooks/useAuth';

interface MemberItemProps {
  member: Member;
}

const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: 'Propriétaire',
  ADMIN: 'Admin',
  MEMBER: 'Membre',
};

export function MemberItem({ member }: MemberItemProps) {
  const { user } = useAuth();
  const { members, updateMemberRole } = useMembers();

  const currentUser = members.find((m) => m.userId === user?.id);
  const canManage = currentUser?.role === 'OWNER' || currentUser?.role === 'ADMIN';
  const isSelf = member.userId === user?.id;
  const canChangeRole = canManage && !isSelf && member.role !== 'OWNER';

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as MemberRole;
    try {
      await updateMemberRole(member.userId, newRole);
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  return (
    <div className="member-item">
      <span
        className={member.isOnline ? 'online-indicator' : 'offline-indicator'}
        title={member.isOnline ? 'En ligne' : 'Hors ligne'}
      >
        ●
      </span>

      <div className="member-info">
        <span className="member-name">
          {member.username}
          {isSelf && <span className="member-self"> (vous)</span>}
        </span>
        <span className={`member-role member-role-${member.role.toLowerCase()}`}>
          {ROLE_LABELS[member.role]}
        </span>
      </div>

      {canChangeRole && (
        <select
          className="member-role-select"
          value={member.role}
          onChange={handleRoleChange}
        >
          <option value="MEMBER">Membre</option>
          <option value="ADMIN">Admin</option>
        </select>
      )}
    </div>
  );
}