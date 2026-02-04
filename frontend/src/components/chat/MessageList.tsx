'use client';

import React, { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { MessageItem } from './MessageItem';
import { Spinner } from '@/components/ui/Spinner';

interface MessageListProps {
  channelId: string;
}

export function MessageList({ channelId }: MessageListProps) {
  const { messages, isLoading } = useMessages(channelId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="messages-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          Aucun message. Soyez le premier à écrire !
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}