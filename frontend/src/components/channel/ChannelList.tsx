'use client';

import React, { useState } from 'react';
import { useChannels } from '@/hooks/useChannel';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { ChannelItem } from './ChannelItem';
import { CreateChannelModal } from './CreateChannelModal';
import { Button } from '@/components/ui/Button';

export function ChannelList() {
  const { selectedServer, generateInviteCode } = useServers();
  const { channels, selectedChannel, selectChannel } = useChannels();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // L'owner est celui dont l'id correspond à ownerId du serveur
  const isOwner = user?.id === selectedServer?.ownerId;
  // Pour l'instant on considère que seul l'owner peut gérer les channels
  // (la logique admin sera affinée avec useMembers une fois connecté)
  const canManageChannels = isOwner;

  const handleInvite = async () => {
    if (!selectedServer) return;
    try {
      // ✅ generateInviteCode vient du hook, pas appelé à l'intérieur du handler
      const code = await generateInviteCode(selectedServer.id);
      alert(`Code d'invitation : ${code}`);
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