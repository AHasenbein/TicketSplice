"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCurrentUser } from "@/lib/api/auth";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";

interface NavItem {
  href: string;
  label: string;
}

interface AppHeaderProps {
  mobileMenuOpen: boolean;
  onMobileMenuOpenChange: (open: boolean) => void;
  onAuthChange?: (isAuthenticated: boolean) => void;
}

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  return scrollY;
}

function unlockBodyScroll(scrollY: number) {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollY);
}

export function AppHeader({
  mobileMenuOpen,
  onMobileMenuOpenChange,
  onAuthChange
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canSell, setCanSell] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollLockRef = useRef(0);
  const menuPanelRef = useRef<HTMLDivElement>(null);

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
    setMounted(true);
  }, []);

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

  useEffect(() => {
    onMobileMenuOpenChange(false);
  }, [pathname, onMobileMenuOpenChange]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    scrollLockRef.current = lockBodyScroll();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onMobileMenuOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      unlockBodyScroll(scrollLockRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, onMobileMenuOpenChange]);

  const isAuthRoute = pathname.startsWith("/auth");
  const isHome = pathname === "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isEvents = isActive("/events");

  function handleLogout() {
    clearAuthToken();
    setIsAuthenticated(false);
    onAuthChange?.(false);
    setCanSell(false);
    onMobileMenuOpenChange(false);
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
        onClick={() => onMobileMenuOpenChange(false)}
      >
        {item.label}
      </ButtonLink>
    );
  }

  const mobileMenu =
    mounted && mobileMenuOpen ? (
      <div
        className="fixed inset-0 z-[200] md:hidden"
        role="presentation"
        style={{ WebkitTransform: "translateZ(0)" }}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-[rgba(7,6,15,0.75)]"
          onClick={() => onMobileMenuOpenChange(false)}
        />
        <div
          id="mobile-nav"
          ref={menuPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="absolute inset-x-0 bottom-0 grid max-h-[min(85dvh,640px)] gap-3 overflow-y-auto overscroll-contain rounded-t-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-24px_60px_rgba(7,6,15,0.65)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" />
          {isAuthenticated ? (
            <>
              <p className="muted-text px-1 text-xs uppercase tracking-[0.18em]">Menu</p>
              <ButtonLink
                href="/"
                variant={isHome ? "secondary" : "ghost"}
                className="w-full justify-start px-4"
                onClick={() => onMobileMenuOpenChange(false)}
              >
                Home
              </ButtonLink>
              <div className="grid gap-2">
                {authedMenuItems.map((item) => renderNavLink(item, "w-full"))}
              </div>
              <Button variant="secondary" className="w-full" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <p className="muted-text px-1 text-xs uppercase tracking-[0.18em]">Explore</p>
              <ButtonLink
                href="/"
                variant={isHome ? "secondary" : "ghost"}
                className="w-full justify-start px-4"
                onClick={() => onMobileMenuOpenChange(false)}
              >
                Home
              </ButtonLink>
              <ButtonLink
                href="/events"
                variant={isEvents ? "secondary" : "primary"}
                className="w-full"
                onClick={() => onMobileMenuOpenChange(false)}
              >
                Browse events
              </ButtonLink>
              <p className="muted-text px-1 pt-1 text-xs uppercase tracking-[0.18em]">Account</p>
              <ButtonLink
                href="/auth/login"
                variant="ghost"
                className="w-full justify-start px-4"
                onClick={() => onMobileMenuOpenChange(false)}
              >
                Log in
              </ButtonLink>
              <ButtonLink
                href="/auth/register"
                className="w-full"
                onClick={() => onMobileMenuOpenChange(false)}
              >
                Create account
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    ) : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[rgba(7,6,15,0.88)] pt-[env(safe-area-inset-top)] backdrop-blur-xl border-b border-[var(--border)]">
        <div className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top)] h-px bg-[linear-gradient(90deg,transparent,rgba(255,46,168,0.55),rgba(34,211,255,0.55),transparent)]" />
        <div className="page-shell flex h-14 items-center justify-between gap-2 sm:h-16">
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

          <nav className="flex min-w-0 items-center gap-2">
            <ButtonLink
              href="/events"
              variant={isEvents ? "secondary" : "ghost"}
              className="hidden px-3 sm:inline-flex md:hidden"
              aria-current={isEvents ? "page" : undefined}
            >
              Events
            </ButtonLink>

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
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(232,235,243,0.06)] text-[var(--foreground)] transition active:scale-95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] md:hidden"
                  onClick={() => onMobileMenuOpenChange(!mobileMenuOpen)}
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

                {!isAuthRoute && isHome ? (
                  <ButtonLink href="/auth/login" variant="ghost" className="px-4 sm:hidden">
                    Log in
                  </ButtonLink>
                ) : null}

                {!isAuthRoute && !isHome ? (
                  <button
                    type="button"
                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-nav"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(232,235,243,0.06)] text-[var(--foreground)] transition active:scale-95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:hidden"
                    onClick={() => onMobileMenuOpenChange(!mobileMenuOpen)}
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
      </header>
      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
