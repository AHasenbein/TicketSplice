"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const authedPrimaryItems: NavItem[] = [{ href: "/events", label: "Events" }];
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isAuthRoute = pathname.startsWith("/auth");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function handleLogout() {
    clearAuthToken();
    setIsAuthenticated(false);
    setCanSell(false);
    setMobileMenuOpen(false);
    router.push("/auth/login");
  }

  function renderNavLink(item: NavItem, className = "") {
    const active = isActive(item.href);
    return (
      <ButtonLink
        key={item.href}
        href={item.href}
        variant={active ? "secondary" : "ghost"}
        className={`justify-start px-4 ${
          active
            ? ""
            : "hover:!border-[rgba(255,46,168,0.55)] hover:!bg-[rgba(255,46,168,0.12)] hover:text-white hover:shadow-[0_0_18px_rgba(255,46,168,0.4)]"
        } ${className}`}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileMenuOpen(false)}
      >
        {item.label}
      </ButtonLink>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[rgba(7,6,15,0.88)] pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b border-[var(--border)]">
      <div className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] h-px bg-[linear-gradient(90deg,transparent,rgba(255,46,168,0.55),rgba(34,211,255,0.55),transparent)]" />
      <div className="page-shell flex h-14 items-center justify-between sm:h-16">
        <Link
          href="/"
          className="brand-heading group flex min-h-11 min-w-11 items-center gap-2 text-base font-semibold tracking-tight"
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

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                {authedMenuItems.map((item) => renderNavLink(item))}
                <Button variant="secondary" className="px-4" onClick={handleLogout}>
                  Log out
                </Button>
              </div>

              <button
                type="button"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(232,235,243,0.06)] text-[var(--foreground)] transition active:scale-95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] md:hidden"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <span aria-hidden="true" className="grid h-3 w-4 grid-rows-3 gap-[3px]">
                  <span className="h-px w-full rounded bg-current" />
                  <span className="h-px w-full rounded bg-current" />
                  <span className="h-px w-full rounded bg-current" />
                </span>
              </button>
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
                <button
                  type="button"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(232,235,243,0.06)] text-[var(--foreground)] transition active:scale-95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:hidden"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                >
                  <span aria-hidden="true" className="grid h-3 w-4 grid-rows-3 gap-[3px]">
                    <span className="h-px w-full rounded bg-current" />
                    <span className="h-px w-full rounded bg-current" />
                    <span className="h-px w-full rounded bg-current" />
                  </span>
                </button>
              ) : null}
            </>
          )}
        </nav>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[rgba(7,6,15,0.72)] backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="mobile-nav"
            ref={menuPanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-x-0 bottom-0 grid max-h-[min(85dvh,640px)] gap-3 overflow-y-auto rounded-t-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(7,6,15,0.65)]"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" />
            {isAuthenticated ? (
              <>
                <p className="muted-text px-1 text-xs uppercase tracking-[0.18em]">Menu</p>
                <div className="grid gap-2">
                  {authedMenuItems.map((item) => renderNavLink(item, "w-full"))}
                </div>
                <Button variant="secondary" className="w-full" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <p className="muted-text px-1 text-xs uppercase tracking-[0.18em]">Get started</p>
                <ButtonLink
                  href="/auth/login"
                  variant="ghost"
                  className="w-full justify-start px-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </ButtonLink>
                <ButtonLink
                  href="/auth/register"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create account
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
