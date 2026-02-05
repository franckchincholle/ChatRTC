'use client';

import React from 'react';
import { Server } from '@/types/server.types';
import { useServers } from '@/hooks/useServer';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface ServerItemProps {
  server: Server;
  isSelected: boolean;
  onSelect: () => void;
}

export function ServerItem({ server, isSelected, onSelect }: ServerItemProps) {
  const { user } = useAuth();
  const { deleteServer, leaveServer } = useServers();
  
  const isOwner = server.ownerId === user?.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce serveur ?')) {
      try {
        await deleteServer(server.id);
      } catch (err) {
        console.error('Failed to delete server:', err);
      }
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir quitter ce serveur ?')) {
      try {
        await leaveServer(server.id);
      } catch (err) {
        console.error('Failed to leave server:', err);
      }
    }
  };

  return (
    <div 
      className={`server-item ${isSelected ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="server-item-name">{server.name}</div>
      <div className="server-item-actions">
        {isOwner ? (
          <Button variant="icon" onClick={handleDelete}>
            🗑️
          </Button>
        ) : (
          <Button variant="icon" onClick={handleLeave}>
            👋
          </Button>
        )}
      </div>
    </div>
  );
}