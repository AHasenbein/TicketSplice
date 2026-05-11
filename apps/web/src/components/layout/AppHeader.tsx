"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(readAuthToken()));
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, []);

  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(7,11,20,0.8)] backdrop-blur-lg">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link href="/" className="brand-heading text-base font-semibold tracking-tight">
          Ticket Splice
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="h-9 px-4">
                  Dashboard
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="ghost" className="h-9 px-4">
                  Account
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="h-9 px-4"
                onClick={() => {
                  clearAuthToken();
                  setIsAuthenticated(false);
                  router.push("/auth/login");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              {!isAuthRoute ? (
                <Link href="/auth/login">
                  <Button variant="ghost" className="h-9 px-4">
                    Log in
                  </Button>
                </Link>
              ) : null}
              <Link href="/auth/register">
                <Button className="h-9 px-4">Create account</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
