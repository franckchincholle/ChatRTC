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
  const [error, setError]           = useState('');
  const { joinServer, isLoading }   = useServers();

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
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
          >
            Rejoindre
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Code d'invitation"
          type="text"
          placeholder="ex : aBcD1234"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          disabled={isLoading}
          error={error}
          autoFocus
        />
        <p className="modal-hint">
          Demande un code à un administrateur du serveur que tu veux rejoindre.
        </p>
      </form>
    </Modal>
  );
}