'use client';

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { useTyping } from '@/hooks/useTyping';
import { useServers } from '@/hooks/useServer';
import { useChannels } from '@/hooks/useChannel';
import { useAuth } from '@/hooks/useAuth';
import { validateMessage } from '@/utils/validators';
import { Button } from '@/components/ui/Button';

export function MessageInput() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { selectedServer } = useServers();
  const { selectedChannel } = useChannels();
  // ✅ Plus d'argument — le Context gère selectedChannel en interne
  const { sendMessage } = useMessages();
  const { startTyping, stopTyping } = useTyping(
    selectedServer?.id || null,
    selectedChannel?.id || null,
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