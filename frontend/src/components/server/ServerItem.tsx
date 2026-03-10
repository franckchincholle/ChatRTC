'use client';

import React, { useState } from 'react';
import { Server } from '@/types/server.types';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { EditServerModal } from './EditServerModal';

interface ServerItemProps {
  server: Server;
  isSelected: boolean;
  onSelect: () => void;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ServerItem({ server, isSelected, onSelect }: ServerItemProps) {
  const { user }                = useAuth();
  const { leaveServer }         = useServers();
  const [showEdit, setShowEdit] = useState(false);

  const isOwner = server.ownerId === user?.id;

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Quitter « ${server.name} » ?`)) {
      try { await leaveServer(server.id); }
      catch (err) { console.error(err); }
    }
  };

  return (
    <>
      <div className="server-item-wrapper">
        {/* Icône principale */}
        <div
          className={`server-item${isSelected ? ' active' : ''}`}
          onClick={onSelect}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect()}
          aria-label={`Serveur ${server.name}${isSelected ? ' (actif)' : ''}`}
        >
          {getInitials(server.name)}

          {/* Bouton d'action visible au hover */}
          {isSelected && (isOwner ? (
            <button
              className="server-item-action"
              onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
              title="Modifier le serveur"
              aria-label={`Modifier ${server.name}`}
            >
              ✎
            </button>
          ) : (
            <button
              className="server-item-action leave"
              onClick={handleLeave}
              title="Quitter le serveur"
              aria-label={`Quitter ${server.name}`}
            >
              ✕
            </button>
          ))}
        </div>

        {/* Tooltip */}
        <div className="server-item-tooltip">{server.name}</div>
      </div>

      {/* Modale d'édition (owner uniquement) */}
      {isOwner && (
        <EditServerModal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          server={server}
        />
      )}
    </>
  );
}