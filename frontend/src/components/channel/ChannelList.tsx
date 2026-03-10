'use client';

import React, { useState } from 'react';
import { useChannels } from '@/hooks/useChannel';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { ChannelItem } from './ChannelItem';
import { CreateChannelModal } from './CreateChannelModal';

export function ChannelList() {
  const { selectedServer, generateInviteCode } = useServers();
  const { channels, selectedChannel, selectChannel } = useChannels();
  const { user } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteCopied, setInviteCopied]       = useState(false);

  const isOwner = user?.id === selectedServer?.ownerId;

  const handleInvite = async () => {
    if (!selectedServer) return;
    try {
      const code = await generateInviteCode(selectedServer.id);
      await navigator.clipboard.writeText(code);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch (err) {
      console.error('Failed to generate invite code:', err);
    }
  };

  if (!selectedServer) return null;

  return (
    <>
      {/* Toast "Code copié" */}
      {inviteCopied && (
        <div className="invite-toast" role="status" aria-live="polite">
          ✓ Code d'invitation copié !
        </div>
      )}

      <div className="channel-list">
        <div className="channel-section-header">
          <span className="channel-section-label">Canaux</span>
          {isOwner && (
            <button
              className="channel-section-add"
              onClick={() => setShowCreateModal(true)}
              title="Créer un canal"
              aria-label="Créer un canal"
            >
              +
            </button>
          )}
        </div>

        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannel?.id === channel.id}
            onSelect={() => selectChannel(channel)}
            canManage={isOwner}
            onInvite={isOwner ? handleInvite : undefined}
          />
        ))}

        {channels.length === 0 && (
          <div className="channel-empty">
            Aucun canal.{isOwner ? ' Crées-en un avec +' : ''}
          </div>
        )}
      </div>

      <CreateChannelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}