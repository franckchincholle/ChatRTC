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
  const { isAuthenticated, isLoading } = useAuth();
  const { connect, disconnect } = useSocket();
  const router = useRouter();

  // Rediriger vers /login si l'utilisateur n'est pas connecté
  // isLoading ne sera true que pendant login/signup, pas au chargement initial
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
    return () => {
      if (!isAuthenticated) disconnect();
    };
  }, [isAuthenticated, connect, disconnect]);

  // Spinner uniquement pendant login/signup (opérations async)
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