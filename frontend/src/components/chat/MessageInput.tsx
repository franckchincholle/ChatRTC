'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessage';
import { useTyping } from '@/hooks/useTyping';
import { useServers } from '@/hooks/useServer';
import { useChannels } from '@/hooks/useChannel';
import { useAuth } from '@/hooks/useAuth';
import { validateMessage } from '@/utils/validators';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import type { IGif } from '@giphy/js-types';

const gf = new GiphyFetch('UP4mVIQARjHZh1NF8w62C5xxpCV4DymY');

const GIF_CATEGORIES = ['Bonjour', 'MDR', 'Triste', 'Bravo', 'Wtf', 'Amour'];

export function MessageInput() {
  const [content, setContent]           = useState('');
  const [error, setError]               = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');

  const { user }             = useAuth();
  const { selectedServer }   = useServers();
  const { selectedChannel }  = useChannels();
  const { sendMessage }      = useMessages();
  const { startTyping, stopTyping } = useTyping(
    selectedServer?.id || null,
    selectedChannel?.id || null,
    user?.id,
  );

  const pickerRef = useRef<HTMLDivElement>(null);

  /* Ferme le picker en cliquant hors */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowGifPicker(false);
      }
    };
    if (showGifPicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGifPicker]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleGifSelect = async (gif: IGif, e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      await sendMessage(gif.images.original.url);
      setShowGifPicker(false);
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const fetchGifs = (offset: number) =>
    searchTerm
      ? gf.search(searchTerm, { offset, limit: 10, lang: 'fr' })
      : gf.trending({ offset, limit: 10 });

  return (
    <div className="message-form-wrapper">

      {/* ── GIF Picker ── */}
      {showGifPicker && (
        <div className="gif-picker" ref={pickerRef}>
          <div className="gif-picker-header">
            <span className="gif-picker-title">GIF</span>
            <button
              className="gif-picker-close"
              onClick={() => setShowGifPicker(false)}
              aria-label="Fermer le sélecteur GIF"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            className="gif-search-input"
            placeholder="Rechercher un GIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          <div className="gif-categories">
            {GIF_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`gif-category-btn${searchTerm === cat ? ' active' : ''}`}
                onClick={() => setSearchTerm(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="gif-grid-wrapper">
            <Grid
              key={searchTerm}
              width={300}
              columns={3}
              fetchGifs={fetchGifs}
              onGifClick={handleGifSelect}
              noResultsMessage="Aucun GIF trouvé"
            />
          </div>
        </div>
      )}

      {/* ── Input bar ── */}
      <form className="message-form" onSubmit={handleSubmit}>
        <div className="message-input-wrapper">
          {/* Préfixe # */}
          <div className="message-input-prefix" aria-hidden="true">#</div>

          {/* Champ texte */}
          <input
            type="text"
            className="message-input"
            placeholder={
              selectedChannel
                ? `Message dans #${selectedChannel.name}`
                : 'Message...'
            }
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={2000}
            autoComplete="off"
          />

          {/* Boutons droite */}
          <div className="message-input-actions">
            <button
              type="button"
              className={`message-input-btn gif-toggle-btn${showGifPicker ? ' active' : ''}`}
              onClick={() => setShowGifPicker((v) => !v)}
              title="Envoyer un GIF"
              aria-label="Ouvrir le sélecteur GIF"
            >
              GIF
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={!content.trim()}
              aria-label="Envoyer le message"
            >
              ↑
            </button>
          </div>
        </div>

        {error && (
          <div className="message-input-error" role="alert">
            {error}
          </div>
        )}
      </form>

    </div>
  );
}