import type {
  OAuthProviderAdapter,
  OAuthProviderId
} from "../domain/oauth-provider-adapter.js";
import { HttpError } from "../../../shared/http-error.js";

export interface OAuthProviderSummary {
  id: OAuthProviderId;
  enabled: boolean;
}

export class OAuthProviderRegistry {
  private readonly providers = new Map<OAuthProviderId, OAuthProviderAdapter>();

  constructor(adapters: OAuthProviderAdapter[]) {
    for (const adapter of adapters) {
      this.providers.set(adapter.id, adapter);
    }
  }

  listProviderSummaries(): OAuthProviderSummary[] {
    const supported: OAuthProviderId[] = ["google", "apple"];

    return supported.map((id) => ({
      id,
      enabled: this.providers.has(id)
    }));
  }

  getProvider(id: OAuthProviderId): OAuthProviderAdapter {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new HttpError(400, `OAuth provider '${id}' is not enabled.`);
    }

    return provider;
  }
}
