'use client';

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { useTyping } from '@/hooks/useTyping';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { validateMessage } from '@/utils/validators';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { selectedServer } = useServers();
  const { sendMessage } = useMessages(channelId);
  const { startTyping, stopTyping } = useTyping(
    selectedServer?.id || null,
    channelId,
    user?.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateMessage(content);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    try {
      await sendMessage(content);
      setContent('');
      stopTyping();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        type="text"
        className="message-input"
        placeholder="Écrivez un message..."
        value={content}
        onChange={handleChange}
        maxLength={2000}
      />
      <Button type="submit" variant="primary" className="send-button">
        Envoyer
      </Button>
      {error && <span className="auth-error">{error}</span>}
    </form>
  );
}