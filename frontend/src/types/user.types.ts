export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

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