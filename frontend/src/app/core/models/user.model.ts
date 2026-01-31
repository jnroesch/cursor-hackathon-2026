export interface User {
  id: string;
  email: string;
  userName: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  roles?: string[];
  favoriteMedia?: string;
  aboutMe?: string;
}

export interface UserSummary {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface RegisterRequest {
  email: string;
  userName: string;
  displayName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName: string;
  roles?: string[];
  favoriteMedia?: string;
  aboutMe?: string;
}
