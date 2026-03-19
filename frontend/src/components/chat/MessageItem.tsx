'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/types/message.types';
import { useMessages } from '@/hooks/useMessage';
import { useAuth } from '@/hooks/useAuth';
import { useServers } from '@/hooks/useServer';
import { formatMessageTime } from '@/utils/formatDate';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageItemProps {
  message: Message;
  continued?: boolean;
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

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
  const { user }           = useAuth();
  const { selectedServer } = useServers();
  const { deleteMessage, updateMessage, toggleReaction } = useMessages();

  const [menuOpen, setMenuOpen]         = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [editContent, setEditContent]   = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const menuRef      = useRef<HTMLDivElement>(null);
  const emojiRef     = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const isAuthor      = message.userId === user?.id;
  const isServerOwner = user?.id === selectedServer?.ownerId;
  const canDelete     = isAuthor || isServerOwner;
  const canEdit       = isAuthor;
  const showMenu      = canDelete || canEdit;

  const palette = getPalette(message.author.username);

  // Ferme le menu en cliquant hors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setShowEmojiPicker(true), 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (confirm('Supprimer ce message ?')) {
      try { await deleteMessage(message.id); }
      catch (err) { console.error('Failed to delete message:', err); }
    }
  };

  const handleEditStart = () => {
    setEditContent(message.content);
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleEditSubmit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) { setIsEditing(false); return; }
    try {
      await updateMessage(message.id, trimmed);
      setIsEditing(false);
    } catch (err) { console.error('Failed to update message:', err); }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
    if (e.key === 'Escape') { setIsEditing(false); setEditContent(message.content); }
  };

  const handleEmojiClick = async (emoji: string) => {
    setShowEmojiPicker(false);
    try { await toggleReaction(message.id, emoji); }
    catch (err) { console.error('Failed to toggle reaction:', err); }
  };

  // Grouper les réactions par emoji avec compteur
  const reactionGroups = message.reactions.reduce<Record<string, { count: number; hasMine: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasMine: false };
    acc[r.emoji].count++;
    if (r.userId === user?.id) acc[r.emoji].hasMine = true;
    return acc;
  }, {});

  /* ── Bulle emoji ── */
  const emojiPicker = showEmojiPicker ? (
    <div className="reaction-picker" ref={emojiRef}>
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          className="reaction-picker-btn"
          onClick={() => handleEmojiClick(emoji)}
          title={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  ) : null;

  /* ── Réactions affichées sous le message ── */
  const reactionsDisplay = Object.keys(reactionGroups).length > 0 ? (
    <div className="message-reactions">
      {Object.entries(reactionGroups).map(([emoji, { count, hasMine }]) => (
        <button
          key={emoji}
          className={`reaction-badge${hasMine ? ' mine' : ''}`}
          onClick={() => handleEmojiClick(emoji)}
          title={hasMine ? 'Retirer ma réaction' : 'Réagir'}
        >
          {emoji} <span className="reaction-count">{count}</span>
        </button>
      ))}
    </div>
  ) : null;

  /* ── Mode édition ── */
  const editBlock = isEditing ? (
    <div className="message-edit-wrapper">
      <textarea
        className="message-edit-input"
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        onKeyDown={handleEditKeyDown}
        autoFocus
        rows={2}
      />
      <div className="message-edit-actions">
        <button className="message-edit-btn cancel" onClick={() => { setIsEditing(false); setEditContent(message.content); }}>Annuler</button>
        <button className="message-edit-btn confirm" onClick={handleEditSubmit}>Enregistrer</button>
      </div>
    </div>
  ) : null;

  /* ── Bouton menu ··· ── */
  const menuButton = showMenu ? (
    <div className="message-menu-wrapper" ref={menuRef}>
      <button
        className="message-menu-btn"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Actions"
        title="Actions"
      >
        ···
      </button>
      {menuOpen && (
        <div className="message-menu">
          {canEdit && (
            <button className="message-menu-item" onClick={handleEditStart}>
              <span>✎</span> Modifier
            </button>
          )}
          {canDelete && (
            <button className="message-menu-item danger" onClick={handleDelete}>
              <span>✕</span> Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  /* ── Contenu du message ── */
  const messageContent = isEditing ? editBlock : (
    <>
      {isGif(message.content) ? (
        <Image src={message.content} alt="GIF" className="message-gif" width={300} height={200} unoptimized />
      ) : (
        <>
          {message.content}
          {message.updatedAt !== message.createdAt && (
            <span className="message-edited">(modifié)</span>
          )}
        </>
      )}
      {reactionsDisplay}
    </>
  );

  /* ── Continued message ── */
  if (continued) {
    return (
      <div
        className="message-continued"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {emojiPicker}
        <div className="message-content" style={{ flex: 1, minWidth: 0 }}>
          {messageContent}
        </div>
        {!isEditing && menuButton}
      </div>
    );
  }

  /* ── Full message ── */
  return (
    <div
      className="message"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {emojiPicker}
      {/* Avatar */}
      <div
        className="message-avatar"
        style={{ background: palette.bg, color: palette.color, borderColor: palette.border }}
        aria-hidden="true"
      >
        {getInitials(message.author.username)}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="message-header">
          <span className={`message-author${isServerOwner && message.userId === selectedServer?.ownerId ? ' is-owner' : ''}`}>
            {message.author.username}
          </span>
          <span className="message-time">{formatMessageTime(message.createdAt)}</span>
          {!isEditing && menuButton}
        </div>
        <div className="message-content">
          {messageContent}
        </div>
      </div>
    </div>
  );
}