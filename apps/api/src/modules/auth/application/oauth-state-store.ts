import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";
import { env } from "../../../config/env.js";

export class OAuthStateStore {
  private readonly ttlMs = 10 * 60 * 1000;

  issue(): string {
    const payload = JSON.stringify({
      n: crypto.randomBytes(24).toString("hex"),
      e: Date.now() + this.ttlMs
    });
    const encodedPayload = Buffer.from(payload).toString("base64url");
    const signature = this.sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  consumeOrThrow(state: string): void {
    const [encodedPayload, signature] = state.split(".");
    if (!encodedPayload || !signature) {
      throw new HttpError(400, "Invalid OAuth state.");
    }

    const expectedSignature = this.sign(encodedPayload);
    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new HttpError(400, "Invalid OAuth state.");
    }

    let expiresAt: number;
    try {
      const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
        e?: unknown;
      };
      if (typeof parsed.e !== "number") {
        throw new Error("Missing expiration");
      }
      expiresAt = parsed.e;
    } catch {
      throw new HttpError(400, "Invalid OAuth state.");
    }

    if (Date.now() > expiresAt) {
      throw new HttpError(400, "OAuth state has expired.");
    }
  }

  private sign(payload: string): string {
    return crypto.createHmac("sha256", env.JWT_SECRET).update(payload).digest("base64url");
  }
}
