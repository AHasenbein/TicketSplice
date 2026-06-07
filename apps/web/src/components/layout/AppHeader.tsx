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
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(7,6,15,0.78)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,46,168,0.55),rgba(34,211,255,0.55),transparent)]" />
      <div className="page-shell flex h-16 items-center justify-between">
        <Link
          href="/"
          className="brand-heading group flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--neon-pink),var(--neon-blue))] shadow-[0_0_14px_rgba(255,46,168,0.5)]">
            <span className="absolute inset-0.5 rounded-[5px] bg-[rgba(7,6,15,0.85)]" />
            <span className="relative text-[10px] font-bold tracking-[0.05em] text-white">TS</span>
          </span>
          <span className="hidden sm:inline">
            Ticket <span className="brand-gradient-text">Splice</span>
          </span>
          <span className="sm:hidden">
            <span className="brand-gradient-text">Splice</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {authedPrimaryItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <ButtonLink
                      key={item.href}
                      href={item.href}
                      variant={active ? "secondary" : "ghost"}
                      className={`h-9 px-4 ${
                        active
                          ? ""
                          : "hover:!border-[rgba(255,46,168,0.55)] hover:!bg-[rgba(255,46,168,0.12)] hover:text-white hover:shadow-[0_0_18px_rgba(255,46,168,0.4)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </ButtonLink>
                  );
                })}
                {authedSecondaryItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <ButtonLink
                      key={item.href}
                      href={item.href}
                      variant={active ? "secondary" : "ghost"}
                      className={`h-9 px-4 ${
                        active
                          ? ""
                          : "hover:!border-[rgba(255,46,168,0.55)] hover:!bg-[rgba(255,46,168,0.12)] hover:text-white hover:shadow-[0_0_18px_rgba(255,46,168,0.4)]"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </ButtonLink>
                  );
                })}
              </div>
              <details className="relative md:hidden">
                <summary className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                  Menu
                </summary>
                <div className="absolute right-0 z-20 mt-2 grid min-w-48 gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg">
                  {[...authedPrimaryItems, ...authedSecondaryItems].map((item) => {
                    const active = isActive(item.href);
                    return (
                      <ButtonLink
                        key={item.href}
                        href={item.href}
                        variant={active ? "secondary" : "ghost"}
                        className={`h-9 justify-start px-3 ${
                          active
                            ? ""
                            : "hover:!border-[rgba(255,46,168,0.55)] hover:!bg-[rgba(255,46,168,0.12)] hover:text-white"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </ButtonLink>
                    );
                  })}
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
