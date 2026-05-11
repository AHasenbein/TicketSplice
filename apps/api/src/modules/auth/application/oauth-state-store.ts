import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";

export class OAuthStateStore {
  private readonly states = new Map<string, number>();
  private readonly ttlMs = 10 * 60 * 1000;

  issue(): string {
    const state = crypto.randomBytes(24).toString("hex");
    this.states.set(state, Date.now() + this.ttlMs);
    return state;
  }

  consumeOrThrow(state: string): void {
    const expiresAt = this.states.get(state);
    if (!expiresAt) {
      throw new HttpError(400, "Invalid OAuth state.");
    }

    this.states.delete(state);
    if (Date.now() > expiresAt) {
      throw new HttpError(400, "OAuth state has expired.");
    }
  }
}
