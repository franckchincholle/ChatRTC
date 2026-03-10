'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validators';

export function SignupForm() {
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});

  const { signup, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailV    = validateEmail(email);
    const usernameV = validateUsername(username);
    const passwordV = validatePassword(password);

    if (!emailV.isValid || !usernameV.isValid || !passwordV.isValid) {
      setErrors({
        email:    emailV.error,
        username: usernameV.error,
        password: passwordV.error,
      });
      return;
    }

    try {
      await signup({ email, username, password });
      router.push('/chat');
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-title">Créer un compte</div>
      <div className="auth-subtitle">Rejoins la conversation</div>

      {/* Username */}
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="signup-username">
          Nom d'utilisateur
        </label>
        <input
          id="signup-username"
          type="text"
          className={`auth-input${errors.username ? ' input-error' : ''}`}
          placeholder="ex : marie_dev"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
          autoFocus
        />
        {errors.username && <span className="input-error-message">{errors.username}</span>}
      </div>

      {/* Email */}
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          className={`auth-input${errors.email ? ' input-error' : ''}`}
          placeholder="toi@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && <span className="input-error-message">{errors.email}</span>}
      </div>

      {/* Mot de passe */}
      <div className="auth-field">
        <label className="auth-field-label" htmlFor="signup-password">
          Mot de passe
        </label>
        <input
          id="signup-password"
          type="password"
          className={`auth-input${errors.password ? ' input-error' : ''}`}
          placeholder="Min. 8 caractères"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
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
          ? <><span className="spinner spinner-xs" /> Inscription…</>
          : "S'inscrire"
        }
      </button>
    </form>
  );
}