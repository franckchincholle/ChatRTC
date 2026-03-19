'use client';

import React, { useState } from 'react';
import { useChannels } from '@/hooks/useChannel';
import { validateChannelName } from '@/utils/validators';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const [name, setName]   = useState('');
  const [error, setError] = useState('');
  const { createChannel, isLoading } = useChannels();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateChannelName(name);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    try {
      await createChannel(name);
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
      title="Créer un canal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Créer
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nom du canal"
          type="text"
          placeholder="ex : général, dev, design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          error={error}
          autoFocus
        />
        <p className="modal-hint">
          Le nom sera affiché avec un <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>#</span> devant.
          Utilise des tirets à la place des espaces.
        </p>
      </form>
    </Modal>
  );
}