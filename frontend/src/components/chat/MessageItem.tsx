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

  const isGifContent = (content: string) => {
    return content.includes('giphy.com/media') || content.match(/\.(gif)$/i);
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
      <div className="message-content">
        {isGifContent(message.content) ? (
          <img 
            src={message.content} 
            alt="GIF" 
            style={{ 
              maxWidth: '300px',
              maxHeight: '300px',
              borderRadius: '8px', 
              marginTop: '8px',
              display: 'block'
            }} 
          />
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </div>
  );
}