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

interface AppHeaderProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export function AppHeader({ onAuthChange }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canSell, setCanSell] = useState(false);

  const authedPrimaryItems: NavItem[] = [{ href: "/events", label: "Browse events" }];
  if (canSell) {
    authedPrimaryItems.push({ href: "/listings/new", label: "Sell tickets" });
  }
  authedPrimaryItems.push({ href: "/dashboard", label: "Dashboard" });
  const authedSecondaryItems: NavItem[] = [
    { href: "/listings/mine", label: "My listings" },
    { href: "/account", label: "Account" }
  ];
  const authedMenuItems = [...authedPrimaryItems, ...authedSecondaryItems];

  useEffect(() => {
    const syncAuthState = () => {
      const token = readAuthToken();
      const authed = Boolean(token);
      setIsAuthenticated(authed);
      onAuthChange?.(authed);
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
  }, [onAuthChange]);

  const isAuthRoute = pathname.startsWith("/auth");
  const isHome = pathname === "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isEvents = isActive("/events");
  const isAccount = isActive("/account");

  function handleLogout() {
    clearAuthToken();
    setIsAuthenticated(false);
    onAuthChange?.(false);
    setCanSell(false);
    router.push("/auth/login");
  }

  function renderNavLink(item: NavItem) {
    const active = isActive(item.href);
    return (
      <ButtonLink
        key={item.href}
        href={item.href}
        variant={active ? "secondary" : "ghost"}
        className={`px-4 ${
          active
            ? ""
            : "hover:!border-[rgba(255,46,168,0.55)] hover:!bg-[rgba(255,46,168,0.12)] hover:text-white hover:shadow-[0_0_18px_rgba(255,46,168,0.4)]"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {item.label}
      </ButtonLink>
    );
  }

  return (
    <header className="sticky top-0 z-40 overflow-visible border-b border-[var(--border)] bg-[rgba(7,6,15,0.88)] pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] h-px bg-[linear-gradient(90deg,transparent,rgba(255,46,168,0.55),rgba(34,211,255,0.55),transparent)]" />
      <div className="mx-auto flex w-[min(1180px,94vw)] min-h-16 items-center justify-between gap-2 px-[3vw] py-3 max-md:pt-5 max-md:pb-3 sm:w-[min(1180px,92vw)] sm:px-0">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {!isHome ? (
            <Link
              href="/"
              className="inline-flex h-11 shrink-0 items-center gap-1 rounded-[var(--radius-md)] px-2 text-sm font-semibold text-[var(--silver)] transition active:scale-95 hover:text-white md:hidden"
              aria-label="Back to homepage"
            >
              <span aria-hidden="true">←</span>
              <span>Home</span>
            </Link>
          ) : null}
          <Link
            href="/"
            className="brand-heading group flex min-h-11 shrink-0 items-center gap-2 text-base font-semibold tracking-tight"
          >
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--neon-pink),var(--neon-blue))] shadow-[0_0_14px_rgba(255,46,168,0.5)]">
              <span className="absolute inset-0.5 rounded-[5px] bg-[rgba(7,6,15,0.85)]" />
              <span className="relative text-[10px] font-bold tracking-[0.05em] text-white">MT</span>
            </span>
            <span className="hidden sm:inline">
              Miami <span className="brand-gradient-text">Tix</span>
            </span>
            <span className="sm:hidden">
              <span className="brand-gradient-text">Tix</span>
            </span>
          </Link>
        </div>

        <nav className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {authedMenuItems.map((item) => renderNavLink(item))}
                <Button variant="secondary" className="px-4" onClick={handleLogout}>
                  Log out
                </Button>
              </div>

              <div className="flex items-center gap-1.5 md:hidden">
                <ButtonLink
                  href="/events"
                  variant={isEvents ? "secondary" : "ghost"}
                  className="px-3 text-xs sm:px-4 sm:text-sm"
                  aria-current={isEvents ? "page" : undefined}
                >
                  Events
                </ButtonLink>
                <ButtonLink
                  href="/account"
                  variant={isAccount ? "secondary" : "ghost"}
                  className="px-3 text-xs sm:px-4 sm:text-sm"
                  aria-current={isAccount ? "page" : undefined}
                >
                  Account
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                {!isAuthRoute ? (
                  <ButtonLink href="/auth/login" variant="ghost" className="px-4">
                    Log in
                  </ButtonLink>
                ) : null}
                <ButtonLink href="/auth/register" className="px-4">
                  Create account
                </ButtonLink>
              </div>

              {!isAuthRoute ? (
                <div className="flex items-center gap-1.5 sm:hidden">
                  {!isHome ? (
                    <ButtonLink
                      href="/events"
                      variant={isEvents ? "secondary" : "ghost"}
                      className="px-3 text-xs"
                      aria-current={isEvents ? "page" : undefined}
                    >
                      Events
                    </ButtonLink>
                  ) : null}
                  <ButtonLink href="/auth/login" variant="ghost" className="px-3 text-xs">
                    Log in
                  </ButtonLink>
                  <ButtonLink href="/auth/register" className="px-3 text-xs">
                    Sign up
                  </ButtonLink>
                </div>
              ) : null}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
