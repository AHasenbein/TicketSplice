import { env } from "../config/env.js";
import { HttpError } from "./http-error.js";

function parseTrustedSellerEmails(): string[] {
  return env.TRUSTED_SELLER_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

const trustedSellerEmails = new Set(parseTrustedSellerEmails());

export function getPrimaryTrustedSellerEmail(): string | null {
  return parseTrustedSellerEmails()[0] ?? null;
}

export function isTrustedSeller(email: string): boolean {
  if (trustedSellerEmails.size === 0) {
    return true;
  }
  return trustedSellerEmails.has(email.trim().toLowerCase());
}

export function isPrimaryTrustedSeller(email: string): boolean {
  const primaryEmail = getPrimaryTrustedSellerEmail();
  if (!primaryEmail) {
    return true;
  }
  return email.trim().toLowerCase() === primaryEmail;
}

export function assertTrustedSeller(email: string): void {
  if (!isTrustedSeller(email)) {
    throw new HttpError(
      403,
      "Only trusted seller accounts can create events or listings."
    );
  }
}

export function assertPrimaryTrustedSeller(email: string): void {
  if (!isPrimaryTrustedSeller(email)) {
    throw new HttpError(403, "Only the primary trusted seller can delete all events.");
  }
}
