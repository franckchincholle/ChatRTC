'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChannelSidebar } from '@/components/layout/ChannelSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { MembersSidebar } from '@/components/layout/MembersSidebar';
import { Spinner } from '@/components/ui/Spinner';

export default function ChatPage() {
  // loadUser n'existe plus : l'AuthProvider vérifie le token automatiquement au démarrage
  const { isAuthenticated, isLoading } = useAuth();
  const { connect } = useSocket();
  const router = useRouter();

  // Rediriger vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Connecter le socket une fois authentifié
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
  }, [isAuthenticated, connect]);

  // Afficher un spinner pendant la vérification du token
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="chat-layout">
      <Sidebar />
      <ChannelSidebar />
      <ChatArea />
      <MembersSidebar />
    </div>
  );
}