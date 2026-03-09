'use client';

import React from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
      <div className="auth-link">
        Déjà un compte ?{' '}
        <Link href="/auth/login">Se connecter</Link>
      </div>
    </AuthLayout>
  );
}