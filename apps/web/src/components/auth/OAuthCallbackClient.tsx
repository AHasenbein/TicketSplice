"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { saveAuthToken } from "@/lib/auth/token-storage";

export function OAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (token) {
      saveAuthToken(token);
      router.replace("/dashboard");
    }
  }, [router, token]);

  return (
    <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
      {token ? (
        <p className="muted-text text-sm">Signing you in...</p>
      ) : (
        <div className="grid gap-3">
          <h1 className="brand-heading text-xl font-semibold">OAuth sign-in failed</h1>
          <p className="muted-text text-sm">{error ?? "Please try again."}</p>
          <Link href="/auth/login" className="text-sm underline">
            Back to login
          </Link>
        </div>
      )}
    </SurfaceCard>
  );
}
