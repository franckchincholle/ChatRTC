'use client';

import React from 'react';
import { Message } from '@/types/message.types';
import { useMessages } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { useServers } from '@/hooks/useServer';
import { formatMessageTime } from '@/utils/formatDate';

interface MessageItemProps {
  message: Message;
  /** true = même auteur que le message précédent, on masque avatar + header */
  continued?: boolean;
}

/** Génère 2 initiales depuis un username */
function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

/** Couleur d'avatar déterministe selon le username */
const AVATAR_PALETTES = [
  { bg: '#1a1a2e', color: '#818cf8', border: '#2e3060' },
  { bg: '#1a2a1a', color: '#4ade80', border: '#2e502e' },
  { bg: '#2a1a1a', color: '#f87171', border: '#502e2e' },
  { bg: '#1a2a2a', color: '#22d3ee', border: '#2e4a4a' },
  { bg: '#2a2a1a', color: '#facc15', border: '#4a4a2e' },
  { bg: '#2a1a2a', color: '#e879f9', border: '#4a2e4a' },
];

function getPalette(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function isGif(content: string) {
  return content.includes('giphy.com/media') || /\.(gif)$/i.test(content);
}

export function MessageItem({ message, continued = false }: MessageItemProps) {
  const { user } = useAuth();
  const { selectedServer } = useServers();
  const { deleteMessage } = useMessages();

  const isOwner = message.userId === user?.id;
  const isServerOwner = user?.id === selectedServer?.ownerId;
  const canDelete = isOwner || isServerOwner;

  const palette = getPalette(message.author.username);

  const handleDelete = async () => {
    if (confirm('Supprimer ce message ?')) {
      try {
        await deleteMessage(message.id);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  /* ── Continued message (no avatar / header) ── */
  if (continued) {
    return (
      <div className="message-continued">
        <div className="message-content">
          {isGif(message.content) ? (
            <img
              src={message.content}
              alt="GIF"
              className="message-gif"
            />
          ) : (
            message.content
          )}
        </div>
        {canDelete && (
          <div className="message-actions">
            <button
              className="message-action-btn"
              onClick={handleDelete}
              title="Supprimer"
              aria-label="Supprimer ce message"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── Full message (avatar + header) ── */
  return (
    <div className="message">
      {/* Avatar */}
      <div
        className="message-avatar"
        style={{
          background: palette.bg,
          color: palette.color,
          borderColor: palette.border,
        }}
        aria-hidden="true"
      >
        {getInitials(message.author.username)}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="message-header">
          <span
            className={`message-author${isServerOwner && message.userId === selectedServer?.ownerId ? ' is-owner' : ''}`}
          >
            {message.author.username}
          </span>
          <span className="message-time">
            {formatMessageTime(message.createdAt)}
          </span>
          {canDelete && (
            <div className="message-actions">
              <button
                className="message-action-btn"
                onClick={handleDelete}
                title="Supprimer"
                aria-label="Supprimer ce message"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="message-content">
          {isGif(message.content) ? (
            <img
              src={message.content}
              alt="GIF"
              className="message-gif"
            />
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  );
}