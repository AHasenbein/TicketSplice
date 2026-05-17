"use client";

import Link from "next/link";
import type { Event } from "@/lib/api/events";
import { SurfaceCard } from "../ui/SurfaceCard";

interface EventCardProps {
  event: Event;
  isWishlisted?: boolean;
  isWishlistUpdating?: boolean;
  onToggleWishlist?: (eventId: string) => void;
}

export function EventCard({
  event,
  isWishlisted = false,
  isWishlistUpdating = false,
  onToggleWishlist
}: EventCardProps) {
  const date = new Date(event.startAt).toLocaleString();
  const shouldShowVenue = Boolean(event.venue?.trim()) && event.venue.trim() !== "TBD";

  return (
    <SurfaceCard className="relative grid gap-2 p-5 transition hover:border-white/35" elevated={false}>
      {onToggleWishlist ? (
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-base transition hover:bg-white/10 disabled:opacity-60"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(eventClick) => {
            eventClick.preventDefault();
            eventClick.stopPropagation();
            onToggleWishlist(event.id);
          }}
          disabled={isWishlistUpdating}
        >
          {isWishlisted ? "★" : "☆"}
        </button>
      ) : null}
      <Link
        href={`/events/${event.id}`}
        className="group rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <p className="muted-text text-xs uppercase tracking-[0.16em]">{event.city}</p>
        <h3 className="brand-heading text-xl font-semibold">{event.title}</h3>
        {event.artists.length ? (
          <p className="muted-text text-sm">Artists: {event.artists.join(", ")}</p>
        ) : null}
        {event.isHouseMusic ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(62,164,255,0.95)]">
            Featured
          </p>
        ) : null}
        {shouldShowVenue ? <p className="muted-text text-sm">{event.venue}</p> : null}
        <p className="text-sm text-white/90">{date}</p>
      </Link>
    </SurfaceCard>
  );
}
