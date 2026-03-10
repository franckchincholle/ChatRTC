'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ServerList } from '@/components/server/ServerList';

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Génère les initiales depuis le username
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="server-sidebar">

      {/* Liste des serveurs */}
      <ServerList />

      {/* Séparateur */}
      <div className="server-divider" />

      {/* Footer : avatar utilisateur + déconnexion */}
      <div className="server-sidebar-footer">
        <div
          className="user-avatar-rail"
          title={`Connecté en tant que ${user?.username}`}
        >
          {initials}
          <span className="user-status-dot" />
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Déconnexion"
          aria-label="Se déconnecter"
        >
          {/* Icône "sortie" en SVG inline pour ne pas dépendre d'une lib */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

    </div>
  );
}