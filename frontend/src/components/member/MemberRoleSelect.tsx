'use client';

import React from 'react';
import { MemberRole } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';
import { useServers } from '@/hooks/useServer';

interface MemberRoleSelectProps {
  memberId: string;
  currentRole: MemberRole;
}

export function MemberRoleSelect({ memberId, currentRole }: MemberRoleSelectProps) {
  const { selectedServer } = useServers();
  const { updateMemberRole } = useMembers(selectedServer?.id || null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as MemberRole;
    try {
      await updateMemberRole(memberId, newRole);
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  return (
    <select 
      className="role-select" 
      value={currentRole} 
      onChange={handleChange}
    >
      <option value="member">Member</option>
      <option value="admin">Admin</option>
    </select>
  );
}