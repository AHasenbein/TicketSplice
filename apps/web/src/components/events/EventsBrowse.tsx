"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import { listEvents } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { Alert } from "../ui/Alert";
import { EventCard } from "./EventCard";

export function EventsBrowse() {
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestions, setSuggestions] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [houseOnly, setHouseOnly] = useState(true);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [eventsResponse, suggestionsResponse] = await Promise.all([
          listEvents({
            houseOnly,
            upcomingOnly,
            query: debouncedSearchQuery || undefined
          }),
          debouncedSearchQuery
            ? listEvents({
                houseOnly,
                upcomingOnly,
                query: debouncedSearchQuery,
                limit: 6
              })
            : Promise.resolve([])
        ]);
        if (!cancelled) {
          setEvents(eventsResponse);
          setSuggestions(suggestionsResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load events."
          );
          setSuggestions([]);
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
  }, [houseOnly, upcomingOnly, debouncedSearchQuery]);

  return (
    <section className="grid gap-4" aria-busy={isLoading}>
      <div className="grid gap-1.5">
        <label className="muted-text text-sm" htmlFor="event-search-input">
          Search events or artists
        </label>
        <input
          id="event-search-input"
          className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Try: Fisher, Nora En Pure, rooftop session..."
          value={searchQuery}
        />
        {debouncedSearchQuery && suggestions.length ? (
          <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="muted-text text-xs uppercase tracking-[0.16em]">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--foreground)] transition hover:bg-white/8"
                  onClick={() => setSearchQuery(event.title)}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <label className="muted-text flex items-center gap-2 text-sm">
          <input
            checked={houseOnly}
            onChange={(event) => setHouseOnly(event.target.checked)}
            type="checkbox"
            className="size-4 rounded border-[var(--border)] bg-[var(--surface)]"
          />
          Curated only
        </label>
        <label className="muted-text flex items-center gap-2 text-sm">
          <input
            checked={upcomingOnly}
            onChange={(event) => setUpcomingOnly(event.target.checked)}
            type="checkbox"
            className="size-4 rounded border-[var(--border)] bg-[var(--surface)]"
          />
          Upcoming only
        </label>
      </div>
      {isLoading ? (
        <p className="muted-text text-sm" role="status" aria-live="polite">
          Loading events...
        </p>
      ) : null}
      {errorMessage ? <Alert tone="error">{errorMessage}</Alert> : null}
      {!isLoading && !errorMessage && !events.length ? (
        <Alert tone="info">
          No matching events right now. Try disabling filters or add a new event.
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
