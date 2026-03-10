'use client';

import React, { useState } from 'react';
import { useServers } from '@/hooks/useServer';
import { ServerItem } from './ServerItem';
import { CreateServerModal } from './CreateServerModal';
import { JoinServerModal } from './JoinServerModal';

export function ServerList() {
  const { servers, selectedServer, selectServer } = useServers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal]   = useState(false);

  return (
    <>
      {/* Liste des serveurs */}
      <div className="server-list">
        {servers.map((server) => (
          <ServerItem
            key={server.id}
            server={server}
            isSelected={selectedServer?.id === server.id}
            onSelect={() => selectServer(server)}
          />
        ))}
      </div>

      {/* Séparateur + boutons d'action */}
      <div className="server-divider" />

      <div className="server-actions">
        {/* Créer un serveur */}
        <div className="server-action-wrapper">
          <button
            className="server-action-btn"
            onClick={() => setShowCreateModal(true)}
            aria-label="Créer un serveur"
            title="Créer un serveur"
          >
            +
          </button>
          <div className="server-item-tooltip">Créer un serveur</div>
        </div>

        {/* Rejoindre un serveur */}
        <div className="server-action-wrapper">
          <button
            className="server-action-btn"
            onClick={() => setShowJoinModal(true)}
            aria-label="Rejoindre un serveur"
            title="Rejoindre un serveur"
          >
            ⤵
          </button>
          <div className="server-item-tooltip">Rejoindre un serveur</div>
        </div>
      </div>

      {/* Modals */}
      <CreateServerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinServerModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </>
  );
}