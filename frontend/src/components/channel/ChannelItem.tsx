'use client';

import React, { useState } from 'react';
import { Channel } from '@/types/channel.types';
import { useChannels } from '@/hooks/useChannel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: () => void;
  canManage: boolean;
}

export function ChannelItem({ channel, isSelected, onSelect, canManage }: ChannelItemProps) {
  // ✅ Plus besoin de serverId en argument - le Context le gère
  const { updateChannel, deleteChannel } = useChannels();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(channel.name);

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    try {
      await updateChannel(channel.id, editName);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update channel:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce canal ?')) {
      try {
        await deleteChannel(channel.id);
      } catch (err) {
        console.error('Failed to delete channel:', err);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="channel-item-container">
        <div className="input-group">
          <Input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdate();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button variant="success" onClick={handleUpdate}>✔</Button>
            <Button variant="danger" onClick={() => setIsEditing(false)}>✗</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-item-container">
      <div
        className={`channel-item ${isSelected ? 'active' : ''}`}
        onClick={onSelect}
      >
        # {channel.name}
      </div>
      {canManage && (
        <div className="channel-item-actions">
          <Button variant="icon" onClick={() => setIsEditing(true)}>✏️</Button>
          <Button variant="icon" onClick={handleDelete}>🗑️</Button>
        </div>
      )}
    </div>
  );
}