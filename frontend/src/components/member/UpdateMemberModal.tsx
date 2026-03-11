'use client';

import React, { useState } from 'react';
import { Member, MemberRole } from '@/types/member.types';
import { useMembers } from '@/hooks/useMembers';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface UpdateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

const ROLE_OPTIONS: { value: MemberRole; label: string; desc: string }[] = [
  { value: 'MEMBER', label: 'Membre',  desc: 'Peut lire et envoyer des messages.' },
  { value: 'ADMIN',  label: 'Admin',   desc: 'Peut gérer les canaux et les membres.' },
];

export function UpdateMemberModal({ isOpen, onClose, member }: UpdateMemberModalProps) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role);
  const [error, setError]               = useState('');
  const { updateMemberRole, isLoading } = useMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === member.role) {
      onClose();
      return;
    }

    try {
      await updateMemberRole(member.userId, selectedRole);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setSelectedRole(member.role);
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier le rôle"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="update-member-modal-body">
        {/* Rappel de l'utilisateur ciblé */}
        <div className="update-member-target">
          <span className="update-member-username">{member.username}</span>
          <span className="update-member-current-role">
            Rôle actuel : {member.role.toLowerCase()}
          </span>
        </div>

        {/* Sélection du rôle */}
        <div className="update-member-roles">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`update-member-role-option${selectedRole === opt.value ? ' selected' : ''}`}
              onClick={() => setSelectedRole(opt.value)}
            >
              <div className="update-member-role-header">
                <span className="update-member-role-label">{opt.label}</span>
                {selectedRole === opt.value && (
                  <span className="update-member-role-check">✓</span>
                )}
              </div>
              <span className="update-member-role-desc">{opt.desc}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="auth-error" role="alert">{error}</div>
        )}
      </div>
    </Modal>
  );
}