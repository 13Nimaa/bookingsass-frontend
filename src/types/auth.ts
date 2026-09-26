export interface User {
  userId: string;
  name: string;
  phoneNumber: string;
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
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
