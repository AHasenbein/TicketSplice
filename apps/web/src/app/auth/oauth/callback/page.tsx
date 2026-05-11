import { Suspense } from "react";
import { OAuthCallbackClient } from "@/components/auth/OAuthCallbackClient";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<p className="muted-text text-sm">Loading...</p>}>
      <OAuthCallbackClient />
    </Suspense>
  );
}
