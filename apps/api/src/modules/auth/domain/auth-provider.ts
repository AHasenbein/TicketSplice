export type AuthProviderType = "password" | "google" | "apple";

export interface AuthProvider {
  provider: AuthProviderType;
  providerUserId: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  providers: AuthProvider[];
  createdAt: Date;
}
