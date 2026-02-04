// useAuth Hook
import { useState, useCallback } from 'react';
import { User, LoginDTO, SignupDTO } from '@/types/user.types';
import { authService } from '@/services/api/auth.service';
import { storage } from '@/utils/storage';
import { socketService } from '@/services/socket/socket.service';

export function useAuth() {
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!storage.getToken());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Login with email and password
   */
  const login = useCallback(async (data: LoginDTO) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(data);

      // Store token and user
      storage.setToken(response.token);
      storage.setUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      // Connect to WebSocket
      socketService.connect(response.token);

      return response.user;
    } catch (err: any) {
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Signup with email, username and password
   */
  const signup = useCallback(async (data: SignupDTO) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.signup(data);

      // Store token and user
      storage.setToken(response.token);
      storage.setUser(response.user);

      setUser(response.user);
      setIsAuthenticated(true);

      // Connect to WebSocket
      socketService.connect(response.token);

      return response.user;
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout().catch(console.error);
    } finally {
      // Clear local storage
      storage.clear();

      // Disconnect socket
      socketService.disconnect();

      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(null);
    }
  }, []);

  /**
   * Load current user from token
   */
  const loadUser = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      setIsLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      storage.setUser(userData);
      setIsAuthenticated(true);

      // Connect to WebSocket
      socketService.connect(token);
    } catch (err: any) {
      console.error('Failed to load user:', err);
      // Token is invalid, clear storage
      storage.clear();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    loadUser,
    clearError,
  };
}