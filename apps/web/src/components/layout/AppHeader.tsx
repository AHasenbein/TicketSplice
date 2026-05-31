"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api/auth";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";

interface NavItem {
  href: string;
  label: string;
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canSell, setCanSell] = useState(false);
  const authedPrimaryItems: NavItem[] = [{ href: "/events", label: "Events" }];
  if (canSell) {
    authedPrimaryItems.push({ href: "/listings/new", label: "Sell tickets" });
  }
  authedPrimaryItems.push({ href: "/dashboard", label: "Dashboard" });
  const authedSecondaryItems: NavItem[] = [
    { href: "/listings/mine", label: "My listings" },
    { href: "/account", label: "Account" }
  ];

  useEffect(() => {
    const syncAuthState = () => {
      const token = readAuthToken();
      setIsAuthenticated(Boolean(token));
      if (!token) {
        setCanSell(false);
        return;
      }
      void getCurrentUser(token)
        .then((response) => setCanSell(response.user.isTrustedSeller))
        .catch(() => setCanSell(false));
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
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(7,11,20,0.8)] backdrop-blur-lg">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link href="/" className="brand-heading text-base font-semibold tracking-tight">
          Ticket Splice
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {authedPrimaryItems.map((item) => (
                  <ButtonLink
                    key={item.href}
                    href={item.href}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="h-9 px-4"
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </ButtonLink>
                ))}
                {authedSecondaryItems.map((item) => (
                  <ButtonLink
                    key={item.href}
                    href={item.href}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="h-9 px-4"
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </ButtonLink>
                ))}
              </div>
              <details className="relative md:hidden">
                <summary className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                  Menu
                </summary>
                <div className="absolute right-0 z-20 mt-2 grid min-w-48 gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                  {[...authedPrimaryItems, ...authedSecondaryItems].map((item) => (
                    <ButtonLink
                      key={item.href}
                      href={item.href}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className="h-9 justify-start px-3"
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </ButtonLink>
                  ))}
                </div>
              </details>
              <Button
                variant="secondary"
                className="h-9 px-4"
                onClick={() => {
                  clearAuthToken();
                  setIsAuthenticated(false);
                  setCanSell(false);
                  router.push("/auth/login");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              {!isAuthRoute ? (
                <ButtonLink href="/auth/login" variant="ghost" className="h-9 px-4">
                  Log in
                </ButtonLink>
              ) : null}
              <ButtonLink href="/auth/register" className="h-9 px-4">
                Create account
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
