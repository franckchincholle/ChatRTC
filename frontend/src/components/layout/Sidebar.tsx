'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ServerList } from '@/components/server/ServerList';
import { Button } from '@/components/ui/Button';

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="server-sidebar">
      <div className="server-sidebar-header">
        <h3 className="server-sidebar-title">Serveurs</h3>
        <Button variant="danger" onClick={handleLogout} className="logout-button">
          Déconnexion
        </Button>
      </div>
      
      <div className="user-info">
        Connecté: <strong>{user?.username}</strong>
      </div>

      <ServerList />
    </div>
  );
}