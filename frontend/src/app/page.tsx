'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/utils/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      router.push('/chat');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div className="spinner" />
    </div>
  );
}