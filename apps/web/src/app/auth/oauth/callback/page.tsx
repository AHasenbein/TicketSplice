import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { OAuthCallbackClient } from "@/components/auth/OAuthCallbackClient";

export default function OAuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 items-center justify-center py-14">
        <Suspense fallback={<p className="muted-text text-sm">Loading...</p>}>
          <OAuthCallbackClient />
        </Suspense>
      </main>
    </div>
  );
}
