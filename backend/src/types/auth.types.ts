/**
 * Types et interfaces pour l'authentification
 */

/**
 * Données requises pour l'inscription
 */
export interface SignupData {
  username: string;
  email: string;
  password: string;
}

/**
 * Données requises pour la connexion
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Réponse d'authentification (signup ou login)
 */
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Données pour le refresh token
 */
export interface RefreshTokenData {
  refreshToken: string;
}