// User types

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

/**
 * Données retournées par le backend dans data lors du login/signup
 * { success: true, data: { user, accessToken, refreshToken } }
 */
export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface SignupDTO {
  email: string;
  username: string;
  password: string;
}