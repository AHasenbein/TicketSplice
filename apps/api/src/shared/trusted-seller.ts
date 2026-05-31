import { env } from "../config/env.js";
import { HttpError } from "./http-error.js";

const trustedSellerEmails = new Set(
  env.TRUSTED_SELLER_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export function isTrustedSeller(email: string): boolean {
  if (trustedSellerEmails.size === 0) {
    return true;
  }
  return trustedSellerEmails.has(email.trim().toLowerCase());
}

export function assertTrustedSeller(email: string): void {
  if (!isTrustedSeller(email)) {
    throw new HttpError(
      403,
      "Only trusted seller accounts can create events or listings."
    );
  }
}
