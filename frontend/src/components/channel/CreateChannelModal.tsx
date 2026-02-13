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
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  // ✅ Plus besoin de serverId en argument - le Context le gère
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un canal"
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
            placeholder="Nom du canal"
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