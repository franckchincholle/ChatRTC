'use client';

import React from 'react';
import { ChannelList } from '@/components/channel/ChannelList';

export function ChannelSidebar() {
  return (
    <div className="channel-sidebar">
      <ChannelList />
    </div>
  );
}