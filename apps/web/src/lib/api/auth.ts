import { apiRequest } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  providers: string[];
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: AuthUser;
  verificationRequired: boolean;
  verificationPreviewUrl?: string;
}

export function register(input: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function getCurrentUser(token: string): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/v1/auth/me", {
    token
  });
}

export interface OAuthProviderSummary {
  id: "google" | "apple";
  enabled: boolean;
}

interface OAuthProvidersResponse {
  providers: OAuthProviderSummary[];
  message?: string;
}

interface OAuthStartResponse {
  authorizationUrl: string;
}

export interface VerificationResponse {
  message: string;
  verificationRequired?: boolean;
  verificationPreviewUrl?: string;
}

export async function getOAuthProviders(): Promise<OAuthProvidersResponse> {
  const response = await apiRequest<OAuthProvidersResponse>("/api/v1/auth/oauth/providers");
  return response;
}

export async function getOAuthAuthorizationUrl(
  provider: OAuthProviderSummary["id"]
): Promise<string> {
  const response = await apiRequest<OAuthStartResponse>(`/api/v1/auth/oauth/${provider}/start`);
  return response.authorizationUrl;
}

export function verifyEmail(token: string): Promise<VerificationResponse> {
  return apiRequest<VerificationResponse>("/api/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token })
  });
}

export function resendVerificationEmail(email: string): Promise<VerificationResponse> {
  return apiRequest<VerificationResponse>("/api/v1/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}
