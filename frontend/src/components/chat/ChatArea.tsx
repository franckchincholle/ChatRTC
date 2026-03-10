'use client';

import React from 'react';
import { useChannels } from '@/hooks/useChannel';
import { useServers } from '@/hooks/useServer';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export function ChatArea() {
  const { selectedServer } = useServers();
  const { selectedChannel } = useChannels();

  if (!selectedChannel) {
    return (
      <div className="chat-area">
        <div className="empty-state">
          <div className="empty-state-icon">
            {selectedServer ? '#' : '⌘'}
          </div>
          <p className="empty-state-title">
            {selectedServer
              ? 'Sélectionne un canal'
              : 'Sélectionne un serveur'}
          </p>
          <p className="empty-state-desc">
            {selectedServer
              ? 'Choisis un canal dans la liste pour commencer à échanger'
              : 'Rejoins ou crée un serveur pour commencer'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">

      {/* Header */}
      <div className="chat-header">
        <span className="chat-header-hash">#</span>
        <h2 className="chat-title">{selectedChannel.name}</h2>
      </div>

      {/* Messages */}
      <MessageList />

      {/* Typing */}
      <TypingIndicator
        serverId={selectedServer?.id || null}
        channelId={selectedChannel.id}
      />

      {/* Input */}
      <MessageInput />

    </div>
  );
}