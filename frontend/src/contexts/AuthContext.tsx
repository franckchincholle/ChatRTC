'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, LoginDTO, SignupDTO } from '@/types/user.types';
import { authService } from '@/services/api/auth.service';
import { storage } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDTO) => Promise<User>;
  signup: (data: SignupDTO) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialAuthState(): { user: User | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  try {
    const token = storage.getToken();
    const savedUser = storage.getUser();
    if (token && savedUser) {
      return { user: savedUser, isAuthenticated: true };
    }
  } catch {
    storage.clear();
  }
  return { user: null, isAuthenticated: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialState = getInitialAuthState();
  const [user, setUser] = useState<User | null>(initialState.user);
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (data: LoginDTO): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const authData = await authService.login(data);

      storage.setToken(authData.accessToken);
      storage.setUser(authData.user);

      setUser(authData.user);
      setIsAuthenticated(true);

      return authData.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la connexion");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupDTO): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const authData = await authService.signup(data);

      storage.setToken(authData.accessToken);
      storage.setUser(authData.user);

      setUser(authData.user);
      setIsAuthenticated(true);

      return authData.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout().catch(console.error);
    } finally {
      storage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}