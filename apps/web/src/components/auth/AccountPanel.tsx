"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AccountOverview, AuthUser } from "@/lib/api/auth";
import { getAccountOverview, getCurrentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { clearAuthToken, readAuthToken } from "@/lib/auth/token-storage";
import { deleteAllEventsLocal } from "@/lib/api/events";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { SurfaceCard } from "../ui/SurfaceCard";

export function AccountPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [overview, setOverview] = useState<AccountOverview | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAllEvents, setIsDeletingAllEvents] = useState(false);
  const isLocalhost =
    typeof window !== "undefined" &&
    (["localhost", "127.0.0.1"].includes(window.location.hostname) ||
      window.location.hostname === "::1");

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = readAuthToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const [userResult, accountResult] = await Promise.all([
          getCurrentUser(token),
          getAccountOverview(token)
        ]);
        if (!cancelled) {
          setUser(userResult.user);
          setOverview(accountResult);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError
              ? error.message
              : "Could not load your account."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleDeleteAllEvents() {
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (
      !window.confirm(
        "Delete ALL events, listings, purchases, purchase requests, and wishlist entries? This cannot be undone."
      )
    ) {
      return;
    }

    setIsDeletingAllEvents(true);
    setErrorMessage("");
    setAdminMessage("");
    try {
      const result = await deleteAllEventsLocal(token);
      setOverview((current) =>
        current
          ? {
              ...current,
              wishlistedEvents: [],
              boughtEvents: [],
              sellingEvents: []
            }
          : current
      );
      setAdminMessage(result.message);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError ? error.message : "Could not delete events."
      );
    } finally {
      setIsDeletingAllEvents(false);
    }
  }

  return (
    <SurfaceCard className="w-full max-w-2xl p-6 sm:p-8">
      <h1 className="brand-heading text-2xl font-semibold">Your account</h1>
      <p className="muted-text mt-2 text-sm">Session check from the live API.</p>

      {isLoading ? (
        <p className="muted-text mt-6" role="status" aria-live="polite">
          Loading account...
        </p>
      ) : null}

      {errorMessage ? (
        <Alert tone="error" className="mt-6" announce="assertive">
          {errorMessage}
        </Alert>
      ) : null}
      {adminMessage ? (
        <Alert tone="success" className="mt-6">
          {adminMessage}
        </Alert>
      ) : null}

      {user ? (
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Name</dt>
            <dd>{user.displayName}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Providers</dt>
            <dd>{user.providers.join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
            <dt className="muted-text">Seller access</dt>
            <dd>{user.isTrustedSeller ? "Trusted seller" : "Not approved yet"}</dd>
          </div>
        </dl>
      ) : null}

      {overview ? (
        <div className="mt-8 grid gap-6">
          <section className="grid gap-2">
            <h2 className="brand-heading text-lg font-semibold">Wishlisted events</h2>
            {overview.wishlistedEvents.length ? (
              <ul className="grid gap-2 text-sm">
                {overview.wishlistedEvents.map((event) => (
                  <li
                    key={event.id}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2"
                  >
                    <p>{event.title}</p>
                    <p className="muted-text text-xs">{event.city}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text text-sm">No wishlisted events yet.</p>
            )}
          </section>

          <section className="grid gap-2">
            <h2 className="brand-heading text-lg font-semibold">Ticket requests sent</h2>
            {overview.ticketRequestsSent.length ? (
              <ul className="grid gap-2 text-sm">
                {overview.ticketRequestsSent.map((request) => (
                  <li
                    key={request.requestId}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2"
                  >
                    <p>{request.eventTitle}</p>
                    <p className="muted-text text-xs">
                      {request.city} - {request.quantity} ticket(s) - {request.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text text-sm">No ticket requests sent yet.</p>
            )}
          </section>

          <section className="grid gap-2">
            <h2 className="brand-heading text-lg font-semibold">Events selling</h2>
            {overview.sellingEvents.length ? (
              <ul className="grid gap-2 text-sm">
                {overview.sellingEvents.map((event) => (
                  <li
                    key={event.listingId}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2"
                  >
                    <p>{event.eventTitle}</p>
                    <p className="muted-text text-xs">
                      {event.city} - {event.active ? "Active listing" : "Sold out"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text text-sm">No selling activity yet.</p>
            )}
          </section>

          <section className="grid gap-2">
            <h2 className="brand-heading text-lg font-semibold">Incoming buyer requests</h2>
            {overview.ticketRequestsIncoming.length ? (
              <ul className="grid gap-2 text-sm">
                {overview.ticketRequestsIncoming.map((request) => (
                  <li
                    key={request.requestId}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] px-3 py-2"
                  >
                    <p>{request.eventTitle}</p>
                    <p className="muted-text text-xs">
                      Qty {request.quantity} - Buyer phone: {request.buyerPhone} - {request.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-text text-sm">No incoming requests yet.</p>
            )}
          </section>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            clearAuthToken();
            setUser(null);
            setErrorMessage("Signed out locally. Log in again.");
            router.push("/auth/login");
          }}
        >
          Clear local session
        </Button>
        <ButtonLink href="/auth/login" variant="secondary">
          Log in again
        </ButtonLink>
      </div>
      {isLocalhost && user?.isPrimaryTrustedSeller ? (
        <div className="mt-4">
          <Button
            variant="danger"
            disabled={isDeletingAllEvents}
            onClick={handleDeleteAllEvents}
          >
            {isDeletingAllEvents ? "Deleting..." : "Delete all events (localhost only)"}
          </Button>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
