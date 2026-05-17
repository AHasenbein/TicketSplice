"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/api/events";
import { listArtistSuggestions, listEvents } from "@/lib/api/events";
import { ApiClientError } from "@/lib/api/client";
import { Alert } from "../ui/Alert";
import { EventCard } from "./EventCard";

export function EventsBrowse() {
  const [events, setEvents] = useState<Event[]>([]);
  const [suggestions, setSuggestions] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [debouncedArtistQuery, setDebouncedArtistQuery] = useState("");
  const [debouncedCityQuery, setDebouncedCityQuery] = useState("");
  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 150);
    const artistTimeout = setTimeout(() => {
      setDebouncedArtistQuery(artistQuery.trim());
    }, 150);
    const cityTimeout = setTimeout(() => {
      setDebouncedCityQuery(cityQuery.trim());
    }, 150);

    return () => {
      clearTimeout(searchTimeout);
      clearTimeout(artistTimeout);
      clearTimeout(cityTimeout);
    };
  }, [searchQuery, artistQuery, cityQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadArtistSuggestions() {
      if (!debouncedArtistQuery) {
        setArtistSuggestions([]);
        return;
      }

      try {
        const suggestions = await listArtistSuggestions(debouncedArtistQuery, 12);
        if (!cancelled) {
          setArtistSuggestions(suggestions);
        }
      } catch {
        if (!cancelled) {
          setArtistSuggestions([]);
        }
      }
    }

    void loadArtistSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedArtistQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [eventsResponse, suggestionsResponse] = await Promise.all([
          listEvents({
            query: debouncedSearchQuery || undefined,
            artist: debouncedArtistQuery || undefined,
            city: debouncedCityQuery || undefined
          }),
          debouncedSearchQuery || debouncedArtistQuery || debouncedCityQuery
            ? listEvents({
                query: debouncedSearchQuery,
                artist: debouncedArtistQuery,
                city: debouncedCityQuery,
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
  }, [debouncedSearchQuery, debouncedArtistQuery, debouncedCityQuery]);

  return (
    <section className="grid gap-4" aria-busy={isLoading}>
      <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="muted-text text-sm">Event search</span>
          <input
            id="event-search-input"
            className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Event name or keyword"
            value={searchQuery}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="muted-text text-sm">Artist</span>
          <input
            list="events-artist-suggestions"
            className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
            onChange={(event) => setArtistQuery(event.target.value)}
            placeholder="Artist name"
            value={artistQuery}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="muted-text text-sm">City</span>
          <input
            className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
            onChange={(event) => setCityQuery(event.target.value)}
            placeholder="City"
            value={cityQuery}
          />
        </label>
      </div>
      <datalist id="events-artist-suggestions">
        {artistSuggestions.map((artist) => (
          <option key={artist} value={artist} />
        ))}
      </datalist>
        {Boolean(debouncedSearchQuery || debouncedArtistQuery || debouncedCityQuery) &&
        suggestions.length ? (
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
