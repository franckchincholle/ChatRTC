// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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