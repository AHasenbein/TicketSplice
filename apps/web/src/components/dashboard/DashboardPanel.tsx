"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export function DashboardPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const token = readAuthToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const response = await getCurrentUser(token);
        if (!cancelled) {
          setUser(response.user);
        }
      } catch (error) {
        clearAuthToken();
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError
              ? error.message
              : "Your session expired. Please log in again."
          );
          router.replace("/auth/login");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return <p className="muted-text text-sm">Loading your dashboard...</p>;
  }

  return (
    <div className="grid w-full max-w-3xl gap-4">
      <SurfaceCard className="p-6 sm:p-8">
        <p className="muted-text text-xs uppercase tracking-[0.18em]">signed in</p>
        <h1 className="brand-heading mt-2 text-3xl font-semibold">
          {user ? `Welcome, ${user.displayName}` : "Welcome"}
        </h1>
        <p className="muted-text mt-2 text-sm">
          Your account is ready. Start browsing events or jump into your profile.
        </p>
        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
            {errorMessage}
          </p>
        ) : null}
      </SurfaceCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <SurfaceCard className="p-5">
          <h2 className="brand-heading text-lg font-medium">Next step</h2>
          <p className="muted-text mt-2 text-sm">Browse listings and discover upcoming events.</p>
          <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">
            Go to homepage
          </Link>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <h2 className="brand-heading text-lg font-medium">Account</h2>
          <p className="muted-text mt-2 text-sm">Manage your current session and profile details.</p>
          <Link
            href="/account"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Open account page
          </Link>
        </SurfaceCard>
      </div>

      <div className="flex justify-start">
        <Button
          variant="ghost"
          onClick={() => {
            clearAuthToken();
            router.replace("/auth/login");
          }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}
