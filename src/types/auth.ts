export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// BFF strips refreshToken before sending to client
export interface ClientAuthResponse {
  user: User;
  accessToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
