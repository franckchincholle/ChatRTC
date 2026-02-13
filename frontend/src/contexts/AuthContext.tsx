'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, LoginDTO, SignupDTO } from '@/types/user.types';
import { authService } from '@/services/api/auth.service';
import { storage } from '@/utils/storage';

// ============================================
// TYPES DU CONTEXT
// ============================================

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

// ============================================
// CRÉATION DU CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true au départ pour vérifier le token
  const [error, setError] = useState<string | null>(null);

  // Vérifier si un token existe au chargement de l'app
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      const savedUser = storage.getUser();

      if (token && savedUser) {
        // On a un token et un user en cache → on les utilise directement
        setUser(savedUser);
        setIsAuthenticated(true);
      }
      // Pas de token → l'utilisateur n'est pas connecté
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginDTO): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(data);

      // ✅ Utiliser accessToken (pas token)
      storage.setToken(response.accessToken);
      storage.setUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      return response.user;
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupDTO): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signup(data);

      // ✅ Utiliser accessToken (pas token)
      storage.setToken(response.accessToken);
      storage.setUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      return response.user;
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription");
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}