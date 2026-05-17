"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import { addEventToWishlist } from "@/lib/api/auth";
import type { Listing } from "@/lib/api/listings";
import { getEvent } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { listListings } from "@/lib/api/listings";
import { readAuthToken } from "@/lib/auth/token-storage";
import { ListingCard } from "../listings/ListingCard";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { SurfaceCard } from "../ui/SurfaceCard";

interface EventDetailProps {
  eventId: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [listingsErrorMessage, setListingsErrorMessage] = useState("");
  const [wishlistMessage, setWishlistMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEventDetail() {
      setIsLoading(true);
      setErrorMessage("");
      setListingsErrorMessage("");
      try {
        const eventResponse = await getEvent(eventId);
        if (!cancelled) {
          setEvent(eventResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load event details."
          );
          setListings([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    async function loadListings() {
      try {
        const listingsResponse = await listListings(eventId);
        if (!cancelled) {
          setListings(listingsResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setListings([]);
          setListingsErrorMessage(
            error instanceof ApiClientError
              ? error.message
              : "Could not load ticket listings right now."
          );
        }
      }
    }

    void loadEventDetail();
    void loadListings();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <p className="muted-text text-sm" role="status" aria-live="polite">
        Loading event details...
      </p>
    );
  }

  if (errorMessage) {
    return <Alert tone="error" announce="assertive">{errorMessage}</Alert>;
  }

  if (!event) {
    return <p className="muted-text text-sm">Event not found.</p>;
  }

  const shouldShowVenue = Boolean(event.venue?.trim()) && event.venue.trim() !== "TBD";
  const shouldShowDescription =
    Boolean(event.description?.trim()) &&
    event.description?.trim() !== "User-submitted event pending schedule confirmation.";

  return (
    <div className="grid gap-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/events" className="muted-text underline underline-offset-4">
          Back to events
        </Link>
        <span className="muted-text">/</span>
        <span className="muted-text">Event details</span>
      </nav>
      <SurfaceCard className="grid gap-3 p-6 sm:p-8">
        <p className="muted-text text-xs uppercase tracking-[0.18em]">{event.city}</p>
        <h1 className="brand-heading text-3xl font-semibold">{event.title}</h1>
        {event.artists.length ? (
          <p className="muted-text text-sm">Artists: {event.artists.join(", ")}</p>
        ) : null}
        {event.isHouseMusic ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(62,164,255,0.95)]">
            Featured Event
          </p>
        ) : null}
        <p className="muted-text text-sm">
          {shouldShowVenue ? `${event.venue} - ` : ""}
          {new Date(event.startAt).toLocaleString()}
        </p>
        {shouldShowDescription ? (
          <p className="text-sm text-white/90">{event.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-2">
          <ButtonLink href="/listings/new">Sell tickets for this event</ButtonLink>
          <Button
            variant="secondary"
            type="button"
            onClick={async () => {
              const token = readAuthToken();
              if (!token) {
                setWishlistMessage("Log in to save events to your wishlist.");
                return;
              }
              try {
                await addEventToWishlist(event.id, token);
                setWishlistMessage("Added to wishlist.");
              } catch (error) {
                setWishlistMessage(
                  error instanceof ApiClientError ? error.message : "Could not update wishlist."
                );
              }
            }}
          >
            ☆ Wishlist
          </Button>
        </div>
        {wishlistMessage ? <Alert tone="info">{wishlistMessage}</Alert> : null}
      </SurfaceCard>

      <section className="grid gap-3">
        <h2 className="brand-heading text-xl font-semibold">Available ticket listings</h2>
        {listingsErrorMessage ? <Alert tone="error">{listingsErrorMessage}</Alert> : null}
        {listings.length ? (
          <div className="grid gap-3">
            {listings.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
        ) : (
          <SurfaceCard className="p-4" elevated={false}>
            <p className="muted-text text-sm">No active listings yet for this event.</p>
          </SurfaceCard>
        )}
      </section>
    </div>
  );
}
