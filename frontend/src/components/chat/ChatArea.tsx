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
          {selectedServer
            ? 'Sélectionnez un canal pour commencer'
            : 'Sélectionnez un serveur pour commencer'}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h2 className="chat-title"># {selectedChannel.name}</h2>
      </div>

      <MessageList />

      <TypingIndicator
        serverId={selectedServer?.id || null}
        channelId={selectedChannel.id}
      />

      <MessageInput />
    </div>
  );
}