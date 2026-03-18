'use client';

import React, { useState } from 'react';
import { Server } from '@/types/server.types';
import { useServers } from '@/hooks/useServer';
import { validateServerName } from '@/utils/validators';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface EditServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
}

export function EditServerModal({ isOpen, onClose, server }: EditServerModalProps) {
  const [name, setName]         = useState(server.name);
  const [error, setError]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { updateServer, deleteServer, isLoading } = useServers();

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateServerName(name);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    if (name.trim() === server.name) {
      onClose();
      return;
    }

    try {
      await updateServer(server.id, name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteServer(server.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setConfirmDelete(false);
    setError('');
    setName(server.name);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier le serveur"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {/* Supprimer à gauche */}
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {confirmDelete ? 'Confirmer la suppression' : 'Supprimer le serveur'}
          </Button>

          {/* Annuler + Enregistrer à droite */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleRename} loading={isLoading}>
              Enregistrer
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleRename}>
        <Input
          label="Nom du serveur"
          type="text"
          placeholder="Nouveau nom"
          value={name}
          onChange={(e) => { setName(e.target.value); setConfirmDelete(false); }}
          disabled={isLoading}
          error={error}
          autoFocus
        />
        {confirmDelete && (
          <p className="modal-hint" style={{ color: 'var(--danger)', marginTop: '12px' }}>
            ⚠ Cette action est irréversible. Clique à nouveau sur &quot;Confirmer&quot; pour supprimer définitivement.
          </p>
        )}
      </form>
    </Modal>
  );
}