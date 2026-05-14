"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { saveAuthToken } from "@/lib/auth/token-storage";

export function OAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");
  const [isRedirectSlow, setIsRedirectSlow] = useState(false);

  useEffect(() => {
    if (token) {
      saveAuthToken(token);
      const timeout = setTimeout(() => {
        setIsRedirectSlow(true);
      }, 2500);
      router.replace("/dashboard");
      return () => {
        clearTimeout(timeout);
      };
    }
    return undefined;
  }, [router, token]);

  return (
    <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
      {token ? (
        <div className="grid gap-3">
          <p className="muted-text text-sm" role="status" aria-live="polite">
            Signing you in...
          </p>
          {isRedirectSlow ? (
            <ButtonLink href="/dashboard" variant="secondary" className="h-9 px-3">
              Continue to dashboard
            </ButtonLink>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3">
          <h1 className="brand-heading text-xl font-semibold">OAuth sign-in failed</h1>
          <Alert tone="error" announce="assertive">
            {error ?? "Please try again."}
          </Alert>
          <Link href="/auth/login" className="text-sm underline">
            Back to login
          </Link>
        </div>
      )}
    </SurfaceCard>
  );
}
