"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
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
        <p className="mt-3 text-sm text-red-100">Missing verification token.</p>
        <Link href="/auth/login" className="muted-text mt-5 inline-block text-sm underline">
          Continue to login
        </Link>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="w-full max-w-md p-6 sm:p-8">
      <h1 className="brand-heading text-xl font-semibold">Email verification</h1>
      <p className={`mt-3 text-sm ${hasError ? "text-red-100" : "text-emerald-100"}`}>
        {message}
      </p>
      <Link href="/auth/login" className="muted-text mt-5 inline-block text-sm underline">
        Continue to login
      </Link>
    </SurfaceCard>
  );
}
