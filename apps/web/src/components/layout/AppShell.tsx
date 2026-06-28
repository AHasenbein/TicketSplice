"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppShell({ children }: PropsWithChildren) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="flex min-h-screen min-h-dvh flex-col">
      <AppHeader
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuOpenChange={setMobileMenuOpen}
        onAuthChange={setIsAuthenticated}
      />
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
      <MobileBottomNav
        isAuthenticated={isAuthenticated}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />
    </div>
  );
}
