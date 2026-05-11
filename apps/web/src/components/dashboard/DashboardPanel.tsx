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
    <div className="grid w-full max-w-4xl gap-5">
      <SurfaceCard className="grid gap-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted-text text-xs uppercase tracking-[0.18em]">dashboard</p>
            <h1 className="brand-heading mt-2 text-3xl font-semibold">
              {user ? `Welcome, ${user.displayName}` : "Welcome"}
            </h1>
            <p className="muted-text mt-2 text-sm">
              You are signed in and ready to browse listings or manage your account.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="secondary">Browse events</Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost">My account</Button>
            </Link>
          </div>
        </div>
        {errorMessage ? (
          <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
            {errorMessage}
          </p>
        ) : null}
      </SurfaceCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard className="p-5" elevated={false}>
          <p className="muted-text text-xs uppercase tracking-[0.16em]">Status</p>
          <p className="brand-heading mt-3 text-base font-medium">Account active</p>
          <p className="muted-text mt-1 text-sm">Session is valid and secured.</p>
        </SurfaceCard>
        <SurfaceCard className="p-5" elevated={false}>
          <p className="muted-text text-xs uppercase tracking-[0.16em]">Auth</p>
          <p className="brand-heading mt-3 text-base font-medium">
            {user?.providers.join(", ") || "Unknown"}
          </p>
          <p className="muted-text mt-1 text-sm">Sign-in method linked to your profile.</p>
        </SurfaceCard>
        <SurfaceCard className="p-5" elevated={false}>
          <p className="muted-text text-xs uppercase tracking-[0.16em]">Quick action</p>
          <p className="brand-heading mt-3 text-base font-medium">Continue setup</p>
          <p className="muted-text mt-1 text-sm">Add listing details and preferences next.</p>
        </SurfaceCard>
      </div>

      <div className="flex justify-start">
        <Button
          variant="danger"
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
