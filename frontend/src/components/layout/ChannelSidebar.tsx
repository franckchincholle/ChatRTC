'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChannelList } from '@/components/channel/ChannelList';

export function ChannelSidebar() {
  const { user } = useAuth();

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="channel-sidebar">

      {/* Liste des channels */}
      <ChannelList />

      {/* Footer : infos utilisateur connecté */}
      <div className="channel-sidebar-footer">
        <div className="user-avatar-sm">
          {initials}
          <span className="status-dot" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name-sm">{user?.username ?? '—'}</div>
          <div className="user-tag-sm">En ligne</div>
        </div>
      </div>

    </div>
  );
}