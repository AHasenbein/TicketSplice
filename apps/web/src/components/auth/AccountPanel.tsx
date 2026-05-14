"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { SurfaceCard } from "../ui/SurfaceCard";

export function AccountPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = readAuthToken();
      if (!token) {
        router.replace("/auth/login");
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
  }, [router]);

  return (
    <SurfaceCard className="w-full max-w-2xl p-6 sm:p-8">
      <h1 className="brand-heading text-2xl font-semibold">Your account</h1>
      <p className="muted-text mt-2 text-sm">Session check from the live API.</p>

      {isLoading ? (
        <p className="muted-text mt-6" role="status" aria-live="polite">
          Loading account...
        </p>
      ) : null}

      {errorMessage ? (
        <Alert tone="error" className="mt-6" announce="assertive">
          {errorMessage}
        </Alert>
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

      <div className="mt-6 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            clearAuthToken();
            setUser(null);
            setErrorMessage("Signed out locally. Log in again.");
            router.push("/auth/login");
          }}
        >
          Clear local session
        </Button>
        <ButtonLink href="/auth/login" variant="secondary">
          Log in again
        </ButtonLink>
      </div>
    </SurfaceCard>
  );
}
