"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import { listEvents } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { Alert } from "../ui/Alert";
import { EventCard } from "./EventCard";

export function EventsBrowse() {
  const [events, setEvents] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const eventsResponse = await listEvents();
        if (!cancelled) {
          setEvents(eventsResponse);
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

  return (
    <section className="grid gap-4" aria-busy={isLoading}>
      {isLoading ? (
        <p className="muted-text text-sm" role="status" aria-live="polite">
          Loading events...
        </p>
      ) : null}
      {errorMessage ? <Alert tone="error">{errorMessage}</Alert> : null}
      {!isLoading && !errorMessage && !events.length ? (
        <Alert tone="info">
          No events are currently listed for sale.
        </Alert>
      ) : null}
      {!isLoading && !errorMessage && events.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
