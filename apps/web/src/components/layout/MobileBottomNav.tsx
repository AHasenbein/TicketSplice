"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileBottomNavProps {
  isAuthenticated: boolean;
  onOpenMenu: () => void;
}

export function MobileBottomNav({ isAuthenticated, onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute) {
    return null;
  }

  const isHome = pathname === "/";
  const isEvents = pathname === "/events" || pathname.startsWith("/events/");

  const tabClass = (active: boolean) =>
    `flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition active:scale-95 ${
      active
        ? "text-white bg-[rgba(255,46,168,0.14)]"
        : "text-[var(--silver)] hover:text-white"
    }`;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(7,6,15,0.94)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-3 py-2">
        <Link href="/" className={tabClass(isHome)} aria-current={isHome ? "page" : undefined}>
          <span aria-hidden="true" className="text-base leading-none">
            ⌂
          </span>
          Home
        </Link>
        <Link
          href="/events"
          className={tabClass(isEvents)}
          aria-current={isEvents ? "page" : undefined}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ◎
          </span>
          Events
        </Link>
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className={tabClass(pathname === "/dashboard" || pathname.startsWith("/dashboard/"))}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
          >
            <span aria-hidden="true" className="text-base leading-none">
              ◫
            </span>
            Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className={tabClass(pathname.startsWith("/auth/login"))}
          >
            <span aria-hidden="true" className="text-base leading-none">
              →
            </span>
            Log in
          </Link>
        )}
        <button
          type="button"
          aria-label="Open menu"
          className={tabClass(false)}
          onClick={onOpenMenu}
        >
          <span aria-hidden="true" className="text-base leading-none">
            ☰
          </span>
          Menu
        </button>
      </div>
    </nav>
  );
}
