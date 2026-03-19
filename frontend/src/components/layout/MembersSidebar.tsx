'use client';

import React from 'react';
import { MemberList } from '@/components/member/MemberList';

export function MembersSidebar() {
  return (
    <div className="members-sidebar">
      <div className="members-sidebar-header">
        <h3 className="members-sidebar-title">Membres</h3>
      </div>
      <MemberList />
    </div>
  );
}