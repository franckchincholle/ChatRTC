'use client';

import React from 'react';
import { MemberRole } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';

interface MemberRoleSelectProps {
  memberId: string;
  currentRole: MemberRole;
}

export function MemberRoleSelect({ memberId, currentRole }: MemberRoleSelectProps) {
  const { updateMemberRole } = useMembers();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as MemberRole;
    try { await updateMemberRole(memberId, newRole); }
    catch (err) { console.error('Failed to update member role:', err); }
  };

  return (
    <select
      className="role-select"
      value={currentRole}
      onChange={handleChange}
      aria-label="Changer le rôle"
    >
      <option value="MEMBER">Membre</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}