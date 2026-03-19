'use client';

import React from 'react';
import { useTyping } from '@/hooks/useTyping';
import { useAuth } from '@/hooks/useAuth';

interface TypingIndicatorProps {
  serverId: string | null;
  channelId: string;
}

export function TypingIndicator({ serverId, channelId }: TypingIndicatorProps) {
  const { user } = useAuth();
  const { getTypingText } = useTyping(serverId, channelId, user?.id);

  const text = getTypingText();
  if (!text) return null;

  return (
    <div className="typing-indicator">
      <div className="typing-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span>{text}</span>
    </div>
  );
}