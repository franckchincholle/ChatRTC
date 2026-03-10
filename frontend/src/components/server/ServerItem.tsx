'use client';

import React, { useState } from 'react';
import { Server } from '@/types/server.types';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';

interface ServerItemProps {
  server: Server;
  isSelected: boolean;
  onSelect: () => void;
}

/** Génère 2 initiales depuis un nom de serveur */
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ServerItem({ server, isSelected, onSelect }: ServerItemProps) {
  const { user }                       = useAuth();
  const { deleteServer, leaveServer }  = useServers();
  const [menuOpen, setMenuOpen]        = useState(false);

  const isOwner = server.ownerId === user?.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Supprimer « ${server.name} » ? Cette action est irréversible.`)) {
      try { await deleteServer(server.id); }
      catch (err) { console.error(err); }
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Quitter « ${server.name} » ?`)) {
      try { await leaveServer(server.id); }
      catch (err) { console.error(err); }
    }
  };

  return (
    <div className="server-item-wrapper">
      {/* Icône principale */}
      <div
        className={`server-item${isSelected ? ' active' : ''}`}
        onClick={onSelect}
        onContextMenu={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
        title={server.name}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        aria-label={`Serveur ${server.name}${isSelected ? ' (actif)' : ''}`}
      >
        {getInitials(server.name)}
      </div>

      {/* Tooltip nom (affiché via CSS hover sur .server-item-wrapper) */}
      <div className="server-item-tooltip">{server.name}</div>

      {/* Menu contextuel (clic droit ou bouton ···) */}
      {menuOpen && (
        <>
          {/* Overlay transparent pour fermer */}
          <div
            className="server-ctx-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="server-ctx-menu">
            <div className="server-ctx-label">{server.name}</div>
            {isOwner ? (
              <button className="server-ctx-item danger" onClick={handleDelete}>
                <span>✕</span> Supprimer le serveur
              </button>
            ) : (
              <button className="server-ctx-item danger" onClick={handleLeave}>
                <span>→</span> Quitter le serveur
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}