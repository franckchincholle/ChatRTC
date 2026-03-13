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
  { value: 'MEMBER', label: 'Membre', desc: 'Peut lire et envoyer des messages.' },
  { value: 'ADMIN',  label: 'Admin',  desc: 'Peut gérer les canaux et les membres.' },
];

const BAN_DURATIONS: { value: string; label: string }[] = [
  { value: '1w',   label: '1 semaine' },
  { value: '2w',   label: '2 semaines' },
  { value: '1m',   label: '1 mois' },
  { value: 'perm', label: "Jusqu'à modification" },
];

type View = 'main' | 'ban';

export function UpdateMemberModal({ isOpen, onClose, member }: UpdateMemberModalProps) {
  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role);
  const [view, setView]                 = useState<View>('main');
  const [banDuration, setBanDuration]   = useState<string | null>(null);
  const [confirmKick, setConfirmKick]   = useState(false);
  const [error, setError]               = useState('');
  const { updateMemberRole, kickMember, banMember, unbanMember, isLoading } = useMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedRole === member.role) { onClose(); return; }
    try {
      await updateMemberRole(member.userId, selectedRole);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleKick = async () => {
    if (!confirmKick) { setConfirmKick(true); return; }
    try {
      await kickMember(member.userId);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBan = async () => {
    if (!banDuration) return;
    try {
      await banMember(member.userId, banDuration as '1w' | '2w' | '1m' | 'perm');
      handleClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUnban = async () => {
    try {
      await unbanMember(member.userId);
      handleClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setSelectedRole(member.role);
    setView('main');
    setBanDuration(null);
    setConfirmKick(false);
    setError('');
    onClose();
  };

  /* ── Vue sélection durée de ban ── */
  if (view === 'ban') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Bannir le membre"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="ghost" onClick={() => setView('main')} disabled={isLoading}>
              ← Retour
            </Button>
            <Button
              variant="danger"
              onClick={handleBan}
              disabled={!banDuration || isLoading}
              loading={isLoading}
            >
              Confirmer le ban
            </Button>
          </div>
        }
      >
        <div className="update-member-modal-body">
          <div className="update-member-target">
            <span className="update-member-username">{member.username}</span>
            <span className="update-member-current-role">Choisir la durée du bannissement</span>
          </div>

          <div className="update-member-roles">
            {BAN_DURATIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`update-member-role-option${banDuration === opt.value ? ' selected danger' : ''}`}
                onClick={() => setBanDuration(opt.value)}
              >
                <div className="update-member-role-header">
                  <span className="update-member-role-label">{opt.label}</span>
                  {banDuration === opt.value && (
                    <span className="update-member-role-check danger">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  /* ── Vue principale ── */
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier le membre"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          {/* Actions danger à gauche */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="danger" onClick={handleKick} disabled={isLoading}>
              {confirmKick ? 'Confirmer le kick' : 'Kick'}
            </Button>
            {member.isBanned ? (
              <Button variant="success" onClick={handleUnban} disabled={isLoading} loading={isLoading}>
                Unban
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => { setConfirmKick(false); setView('ban'); }}
                disabled={isLoading}
              >
                Ban
              </Button>
            )}
          </div>

          {/* Annuler + Enregistrer à droite */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
              Enregistrer
            </Button>
          </div>
        </div>
      }
    >
      <div className="update-member-modal-body">
        <div className="update-member-target">
          <span className="update-member-username">{member.username}</span>
          <span className="update-member-current-role">
            Rôle actuel : {member.role.toLowerCase()}
          </span>
        </div>

        {confirmKick && (
          <p className="modal-hint" style={{ color: 'var(--danger)', marginBottom: '12px' }}>
            ⚠ Clique à nouveau sur "Confirmer le kick" pour expulser {member.username}.
          </p>
        )}

        <div className="update-member-roles">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`update-member-role-option${selectedRole === opt.value ? ' selected' : ''}`}
              onClick={() => { setSelectedRole(opt.value); setConfirmKick(false); }}
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

        {error && <div className="auth-error" role="alert">{error}</div>}
      </div>
    </Modal>
  );
}