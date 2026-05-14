"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import type { Listing } from "@/lib/api/listings";
import { getEvent } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { listListings } from "@/lib/api/listings";
import { ListingCard } from "../listings/ListingCard";
import { Button } from "../ui/Button";
import { SurfaceCard } from "../ui/SurfaceCard";

interface EventDetailProps {
  eventId: string;
}

export function EventDetail({ eventId }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEventDetail() {
      try {
        const [eventResponse, listingsResponse] = await Promise.all([
          getEvent(eventId),
          listListings(eventId)
        ]);
        if (!cancelled) {
          setEvent(eventResponse);
          setListings(listingsResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load event details."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEventDetail();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (isLoading) {
    return <p className="muted-text text-sm">Loading event details...</p>;
  }

  if (errorMessage) {
    return (
      <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
        {errorMessage}
      </p>
    );
  }

  if (!event) {
    return <p className="muted-text text-sm">Event not found.</p>;
  }

  return (
    <div className="grid gap-6">
      <SurfaceCard className="grid gap-3 p-6 sm:p-8">
        <p className="muted-text text-xs uppercase tracking-[0.18em]">{event.city}</p>
        <h1 className="brand-heading text-3xl font-semibold">{event.title}</h1>
        {event.isHouseMusic ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(62,164,255,0.95)]">
            House Music Event
          </p>
        ) : null}
        <p className="muted-text text-sm">
          {event.venue} - {new Date(event.startAt).toLocaleString()}
        </p>
        {event.description ? <p className="text-sm text-white/90">{event.description}</p> : null}
        <div className="pt-2">
          <Link href={`/listings/new?eventId=${encodeURIComponent(event.id)}`}>
            <Button>Sell tickets for this event</Button>
          </Link>
        </div>
      </SurfaceCard>

      <section className="grid gap-3">
        <h2 className="brand-heading text-xl font-semibold">Available ticket listings</h2>
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
