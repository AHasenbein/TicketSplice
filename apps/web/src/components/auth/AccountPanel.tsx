"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { SurfaceCard } from "../ui/SurfaceCard";

export function AccountPanel() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = readAuthToken();
      if (!token) {
        if (!cancelled) {
          setErrorMessage("No active session found. Log in first.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await getCurrentUser(token);
        if (!cancelled) {
          setUser(result.user);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError
              ? error.message
              : "Could not load your account."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SurfaceCard className="w-full max-w-2xl p-6 sm:p-8">
      <h1 className="brand-heading text-2xl font-semibold">Your account</h1>
      <p className="muted-text mt-2 text-sm">Session check from the live API.</p>

      {isLoading ? <p className="muted-text mt-6">Loading account...</p> : null}

      {errorMessage ? (
        <p className="mt-6 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      {user ? (
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Name</dt>
            <dd>{user.displayName}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Providers</dt>
            <dd>{user.providers.join(", ")}</dd>
          </div>
        </dl>
      ) : null}

      <Button
        variant="ghost"
        className="mt-6"
        onClick={() => {
          clearAuthToken();
          setUser(null);
          setErrorMessage("Signed out locally. Log in again.");
        }}
      >
        Clear local session
      </Button>
    </SurfaceCard>
  );
}
