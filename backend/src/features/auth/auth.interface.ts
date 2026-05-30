export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username?: string;
    role: string;
  };
  expiresAt: string;
  expiresInSeconds: number;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username?: string;
  role: string;
  createdAt?: Date;
}
