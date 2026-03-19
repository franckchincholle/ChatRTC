'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword } from '@/utils/validators';

export function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailV    = validateEmail(email);
    const passwordV = validatePassword(password);

    if (!emailV.isValid || !passwordV.isValid) {
      setErrors({ email: emailV.error, password: passwordV.error });
      return;
    }

    try {
      await login({ email, password });
      router.push('/chat');
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-title">Connexion</div>

      {/* Email */}
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          className={`auth-input${errors.email ? ' input-error' : ''}`}
          placeholder="toi@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          autoFocus
        />
        {errors.email && <span className="input-error-message">{errors.email}</span>}
      </div>

      {/* Mot de passe */}
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="login-password">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          className={`auth-input${errors.password ? ' input-error' : ''}`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && <span className="input-error-message">{errors.password}</span>}
      </div>

      {/* Erreur serveur */}
      {error && (
        <div className="auth-error" role="alert">{error}</div>
      )}

      <button
        type="submit"
        className="auth-submit"
        disabled={isLoading}
      >
        {isLoading
          ? <><span className="spinner spinner-xs" /> Connexion…</>
          : 'Se connecter'
        }
      </button>
    </form>
  );
}