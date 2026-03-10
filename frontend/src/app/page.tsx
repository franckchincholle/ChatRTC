'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/utils/storage';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    router.push(token ? '/chat' : '/auth/login');
  }, [router]);

  return (
    <div className="spinner-center" style={{ height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
}