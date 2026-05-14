"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import { listEvents } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { EventCard } from "./EventCard";

export function EventsBrowse() {
  const [events, setEvents] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await listEvents();
        if (!cancelled) {
          setEvents(response);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load events."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p className="muted-text text-sm">Loading events...</p>;
  }

  if (errorMessage) {
    return (
      <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
        {errorMessage}
      </p>
    );
  }

  if (!events.length) {
    return (
      <p className="muted-text text-sm">
        No house events right now. Add one and open the first ticket listings.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <EventCard event={event} key={event.id} />
      ))}
    </div>
  );
}
