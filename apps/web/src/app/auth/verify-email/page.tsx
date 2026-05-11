import { Suspense } from "react";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="muted-text text-sm">Loading...</p>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
