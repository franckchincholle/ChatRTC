'use client';

import React, { useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { MessageItem } from './MessageItem';
import { Spinner } from '@/components/ui/Spinner';

export function MessageList() {
  // ✅ Plus d'argument — le Context gère selectedChannel en interne
  const { messages, isLoading } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas à chaque nouveau message
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