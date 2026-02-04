'use client';

import React, { useState } from 'react';
import { useServers } from '@/hooks/useServer';
import { validateInviteCode } from '@/utils/validators';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinServerModal({ isOpen, onClose }: JoinServerModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const { joinServer, isLoading } = useServers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validateInviteCode(inviteCode);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }

    try {
      await joinServer(inviteCode);
      setInviteCode('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rejoindre un serveur"
      footer={
        <>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Rejoindre'}
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
            placeholder="Code d'invitation"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          {error && <span className="auth-error">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}