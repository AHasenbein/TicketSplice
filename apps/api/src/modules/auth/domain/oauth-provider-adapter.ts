export type OAuthProviderId = "google" | "apple";

export interface OAuthIdentity {
  providerUserId: string;
  email: string;
  displayName?: string;
}

export interface OAuthProviderAdapter {
  id: OAuthProviderId;
  getAuthorizationUrl(state: string): Promise<string>;
  exchangeCodeForIdentity(code: string): Promise<OAuthIdentity>;
}
