"use client";

import Link from "next/link";
import type { Event } from "@/lib/api/events";
import { SurfaceCard } from "../ui/SurfaceCard";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startAt).toLocaleString();

  return (
    <Link href={`/events/${event.id}`}>
      <SurfaceCard className="grid gap-2 p-5 transition hover:border-white/35" elevated={false}>
        <p className="muted-text text-xs uppercase tracking-[0.16em]">{event.city}</p>
        <h3 className="brand-heading text-xl font-semibold">{event.title}</h3>
        {event.isHouseMusic ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[rgba(62,164,255,0.95)]">
            House Music
          </p>
        ) : null}
        <p className="muted-text text-sm">{event.venue}</p>
        <p className="text-sm text-white/90">{date}</p>
      </SurfaceCard>
    </Link>
  );
}
