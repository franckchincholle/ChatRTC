'use client';

import React, { useState } from 'react';
import { useServers } from '@/hooks/useServer';
import { ServerItem } from './ServerItem';
import { CreateServerModal } from './CreateServerModal';
import { JoinServerModal } from './JoinServerModal';
import { Button } from '@/components/ui/Button';

export function ServerList() {
  const { servers, selectedServer, selectServer } = useServers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <>
      <div className="server-actions">
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
        >
          + Créer
        </Button>
        <Button 
          variant="primary" 
          onClick={() => setShowJoinModal(true)}
        >
          Rejoindre
        </Button>
      </div>

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