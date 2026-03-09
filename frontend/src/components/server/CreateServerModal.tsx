'use client';

import React, { useState } from 'react';
import { useServers } from '@/hooks/useServer';
import { validateServerName } from '@/utils/validators';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateServerModal({ isOpen, onClose }: CreateServerModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { createServer, isLoading } = useServers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateServerName(name);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    try {
      await createServer(name);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un serveur"
      footer={
        <>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
          <Button variant="danger" onClick={onClose}>
            Annuler
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <Input
            type="text"
            placeholder="Nom du serveur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          {error && <span className="auth-error">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}