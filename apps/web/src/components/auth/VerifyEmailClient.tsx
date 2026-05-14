"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { Alert } from "@/components/ui/Alert";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token)
      .then((result) => {
        setHasError(false);
        setMessage(result.message);
      })
      .catch((error) => {
        setHasError(true);
        setMessage(
          error instanceof ApiClientError ? error.message : "Verification failed."
        );
      });
  }, [token]);

  if (!token) {
    return (
      <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
        <h1 className="brand-heading text-xl font-semibold">Email verification</h1>
        <Alert tone="error" className="mt-3" announce="assertive">
          Missing verification token.
        </Alert>
        <Link href="/auth/login" className="muted-text mt-5 inline-block text-sm underline">
          Continue to login
        </Link>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
      <h1 className="brand-heading text-xl font-semibold">Email verification</h1>
      <Alert tone={hasError ? "error" : "success"} className="mt-3" announce="polite">
        {message}
      </Alert>
      <Link href="/auth/login" className="muted-text mt-5 inline-block text-sm underline">
        Continue to login
      </Link>
    </SurfaceCard>
  );
}
