'use client';

import React, { useState } from 'react';
import { Channel } from '@/types/channel.types';
import { useChannels } from '@/hooks/useChannel';

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
  canManage: boolean;
  onInvite?: () => void;
}

export function ChannelItem({ channel, isSelected, onSelect, canManage, onInvite }: ChannelItemProps) {
  const { updateChannel, deleteChannel } = useChannels();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName]   = useState(channel.name);

  const handleUpdate = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === channel.name) {
      setIsEditing(false);
      return;
    }
    try {
      await updateChannel(channel.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update channel:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer #${channel.name} ?`)) {
      try { await deleteChannel(channel.id); }
      catch (err) { console.error(err); }
    }
  };

  /* ── Mode édition inline ── */
  if (isEditing) {
    return (
      <div className="channel-item-container">
        <div className="channel-edit-row">
          <span className="channel-hash">#</span>
          <input
            className="channel-edit-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  handleUpdate();
              if (e.key === 'Escape') { setIsEditing(false); setEditName(channel.name); }
            }}
            autoFocus
          />
          <button className="channel-edit-btn confirm" onClick={handleUpdate} title="Confirmer">✓</button>
          <button
            className="channel-edit-btn cancel"
            onClick={() => { setIsEditing(false); setEditName(channel.name); }}
            title="Annuler"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  /* ── Affichage normal ── */
  return (
    <div className="channel-item-container">
      <div
        className={`channel-item${isSelected ? ' active' : ''}`}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        aria-label={`Canal ${channel.name}`}
        aria-current={isSelected ? 'page' : undefined}
      >
        <span className="channel-hash">#</span>
        <span className="channel-item-name">{channel.name}</span>

        {canManage && (
          <div className="channel-item-actions">
            <button
              className="channel-action-btn"
              onClick={(e) => { e.stopPropagation(); onInvite?.(); }}
              title="Inviter des membres"
              aria-label={`Inviter dans #${channel.name}`}
            >
              +
            </button>
            <button
              className="channel-action-btn"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              title="Renommer"
              aria-label={`Renommer #${channel.name}`}
            >
              ✎
            </button>
            <button
              className="channel-action-btn danger"
              onClick={handleDelete}
              title="Supprimer"
              aria-label={`Supprimer #${channel.name}`}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}