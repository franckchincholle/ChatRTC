'use client';

import React from 'react';
import { Message } from '@/types/message.types';
import { useMessages } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { useServers } from '@/hooks/useServer';
import { formatMessageTime } from '@/utils/formatDate';
import { Button } from '@/components/ui/Button';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const { user } = useAuth();
  const { selectedServer } = useServers();
  // ✅ Plus d'argument channelId — le Context le gère
  const { deleteMessage } = useMessages();

  const isOwner = message.userId === user?.id;
  const isServerOwner = user?.id === selectedServer?.ownerId;
  const canDelete = isOwner || isServerOwner;

  const handleDelete = async () => {
    if (confirm('Supprimer ce message ?')) {
      try {
        await deleteMessage(message.id);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  return (
    <div className="message">
      <div className="message-header">
        <span className="message-author">{message.author.username}</span>
        <span className="message-time">{formatMessageTime(message.createdAt)}</span>
        {canDelete && (
          <div className="message-actions">
            <Button variant="icon" onClick={handleDelete}>
              🗑️
            </Button>
          </div>
        )}
      </div>
      <div className="message-content">{message.content}</div>
    </div>
  );
}