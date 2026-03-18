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
          ✓ Code d&apos;invitation copié !
        </div>
      )}

      <div className="channel-list">
        <div className="channel-section-header">
          <span className="channel-section-label">Canaux</span>
          {isOwner && (
            <div style={{ display: 'flex', gap: '2px' }}>
              {/* Inviter un membre */}
              <button
                className="channel-section-add"
                onClick={handleInvite}
                title="Inviter un membre"
                aria-label="Inviter un membre"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </button>
              {/* Créer un canal */}
              <button
                className="channel-section-add"
                onClick={() => setShowCreateModal(true)}
                title="Créer un canal"
                aria-label="Créer un canal"
              >
                +
              </button>
            </div>
          )}
        </div>

        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannel?.id === channel.id}
            onSelect={() => selectChannel(channel)}
            canManage={isOwner}
          />
        ))}

        {channels.length === 0 && (
          <div className="channel-empty">
            Aucun canal.{isOwner ? ' Crée-en un avec +' : ''}
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