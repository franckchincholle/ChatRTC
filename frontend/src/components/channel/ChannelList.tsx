'use client';

import React, { useState } from 'react';
import { useChannels } from '@/hooks/useChannel';
import { useServers } from '@/hooks/useServer';
import { useMembers } from '@/hooks/useMembers';
import { ChannelItem } from './ChannelItem';
import { CreateChannelModal } from './CreateChannelModal';
import { Button } from '@/components/ui/Button';

export function ChannelList() {
  const { selectedServer } = useServers();
  const { channels, selectedChannel, selectChannel } = useChannels(selectedServer?.id || null);
  const { members } = useMembers(selectedServer?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get current user role
  const currentUserRole = members.find(m => m.id === selectedServer?.ownerId)?.role || 'member';
  const canManageChannels = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleInvite = async () => {
    if (!selectedServer) return;
    
    try {
      const { generateInviteCode } = useServers();
      const code = await generateInviteCode(selectedServer.id);
      alert(`Code d'invitation: ${code}`);
    } catch (err) {
      console.error('Failed to generate invite code:', err);
    }
  };

  if (!selectedServer) return null;

  return (
    <>
      <div className="channel-sidebar-header">
        <h3 className="channel-sidebar-title">{selectedServer.name}</h3>
        {canManageChannels && (
          <Button variant="success" onClick={handleInvite} className="invite-button">
            📋 Inviter
          </Button>
        )}
      </div>

      {canManageChannels && (
        <div style={{ padding: '0.5rem' }}>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            style={{ width: '100%' }}
          >
            + Créer Canal
          </Button>
        </div>
      )}

      <div className="channel-list">
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannel?.id === channel.id}
            onSelect={() => selectChannel(channel)}
            canManage={canManageChannels}
          />
        ))}
      </div>

      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}