'use client';

import React, { useState } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { useTyping } from '@/hooks/useTyping';
import { useServers } from '@/hooks/useServer';
import { useChannels } from '@/hooks/useChannel';
import { useAuth } from '@/hooks/useAuth';
import { validateMessage } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

const gf = new GiphyFetch('UP4mVIQARjHZh1NF8w62C5xxpCV4DymY');

export function MessageInput() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const { user } = useAuth();
  const { selectedServer } = useServers();
  const { selectedChannel } = useChannels();
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

  const handleGifSelect = async (gif: any, e: React.SyntheticEvent<HTMLElement, Event>) => {
    e.preventDefault();
    try {
      await sendMessage(gif.images.original.url);
      setShowGifPicker(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 });

  return (
    <div className="message-input-container" style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} className="message-form" style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="message-input"
          placeholder="Écrivez un message..."
          value={content}
          onChange={handleChange}
          maxLength={2000}
          style={{ flexGrow: 1 }}
        />

        <Button 
          type="button" 
          variant="primary" 
          onClick={() => setShowGifPicker(!showGifPicker)}
        >
          GIF
        </Button>

        <Button type="submit" variant="primary" className="send-button">
          Envoyer
        </Button>
        {error && <span className="auth-error">{error}</span>}
      </form>

      {showGifPicker && (
        <div 
          className="gif-picker" 
          style={{ 
            position: 'absolute', 
            bottom: '60px', 
            right: '0', 
            zIndex: 10, 
            backgroundColor: 'white', 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            height: '350px',
            overflowY: 'auto'
          }}
        >
          <Grid 
            width={300} 
            columns={3} 
            fetchGifs={fetchGifs} 
            onGifClick={handleGifSelect} 
          />
        </div>
      )}
    </div>
  );
}