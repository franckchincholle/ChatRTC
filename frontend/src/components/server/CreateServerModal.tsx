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
  const [name, setName]   = useState('');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un serveur"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Créer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nom du serveur"
          type="text"
          placeholder="Mon super serveur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          error={error}
          autoFocus
        />
      </form>
    </Modal>
  );
}