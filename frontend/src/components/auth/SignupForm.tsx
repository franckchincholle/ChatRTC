'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    email?: string; 
    username?: string; 
    password?: string;
  }>({});
  
  const { signup, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const emailValidation = validateEmail(email);
    const usernameValidation = validateUsername(username);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !usernameValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        username: usernameValidation.error,
        password: passwordValidation.error,
      });
      return;
    }

    try {
      await signup({ email, username, password });
      router.push('/chat');
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div>
        <Input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        {errors.username && <span className="auth-error">{errors.username}</span>}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        {errors.email && <span className="auth-error">{errors.email}</span>}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Mot de passe (min. 8 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        {errors.password && <span className="auth-error">{errors.password}</span>}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Inscription...' : "S'inscrire"}
      </Button>
    </form>
  );
}