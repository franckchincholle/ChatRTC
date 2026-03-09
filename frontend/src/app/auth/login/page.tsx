'use client';

import React from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
      <div className="auth-link">
        Pas encore de compte ?{' '}
        <Link href="/auth/signup">S&apos;inscrire</Link>
      </div>
    </AuthLayout>
  );
}