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
    <SurfaceCard
      className="relative aspect-square overflow-hidden p-2.5 transition hover:-translate-y-0.5 hover:border-[rgba(255,46,168,0.55)] hover:shadow-[0_18px_38px_rgba(255,46,168,0.22),0_0_0_1px_rgba(34,211,255,0.22)]"
      elevated={false}
    >
      {onToggleWishlist ? (
        <button
          type="button"
          className="absolute right-2.5 top-2.5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full silver-border bg-[var(--surface)] text-base transition hover:bg-white/10 disabled:opacity-60"
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
        className="group grid h-full grid-rows-[minmax(0,1fr)_auto] gap-2 rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <div className="overflow-hidden rounded-[var(--radius-md)] silver-border">
          {event.imageUrl ? (
            <img
              alt={`${event.title} event image`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              src={event.imageUrl}
            />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(62,164,255,0.22),rgba(255,255,255,0.06))]" />
          )}
        </div>
        <div className="grid gap-1 pb-0.5">
          <p className="muted-text text-xs uppercase tracking-[0.16em]">{event.city}</p>
          <h3 className="brand-heading line-clamp-2 text-lg font-semibold leading-snug">{event.title}</h3>
          {shouldShowVenue ? (
            <p className="muted-text line-clamp-1 text-sm">{event.venue}</p>
          ) : null}
          <p className="line-clamp-1 text-sm text-white/85">{date}</p>
        </div>
      </Link>
    </SurfaceCard>
  );
}
