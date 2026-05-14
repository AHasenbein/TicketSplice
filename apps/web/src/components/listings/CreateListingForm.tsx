"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { createListing } from "@/lib/api/listings";
import { getEvent, listEvents } from "@/lib/api/events";
import type { Event } from "@/lib/api/events";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

export function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedEventFromQuery = searchParams.get("eventId") ?? "";
  const [eventId, setEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [debouncedEventSearchQuery, setDebouncedEventSearchQuery] = useState("");
  const [eventSuggestions, setEventSuggestions] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [priceError, setPriceError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [eventSearchError, setEventSearchError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedEventSearchQuery(eventSearchQuery.trim());
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [eventSearchQuery]);

  useEffect(() => {
    let cancelled = false;
    async function loadEventSuggestions() {
      setIsLoadingEvents(true);
      try {
        const response = await listEvents({
          houseOnly: false,
          upcomingOnly: true,
          query: debouncedEventSearchQuery || undefined,
          limit: 8
        });
        if (!cancelled) {
          setEventSuggestions(response);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load events for listing."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingEvents(false);
        }
      }
    }

    void loadEventSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedEventSearchQuery]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateEventFromQuery() {
      if (!selectedEventFromQuery) {
        return;
      }

      try {
        const event = await getEvent(selectedEventFromQuery);
        if (!cancelled) {
          setSelectedEvent(event);
          setEventId(event.id);
          setEventSearchQuery(event.title);
        }
      } catch {
        // ignore invalid query value
      }
    }

    void hydrateEventFromQuery();

    return () => {
      cancelled = true;
    };
  }, [selectedEventFromQuery]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (!eventId) {
      setEventSearchError("Select an event before publishing.");
      return;
    }
    setEventSearchError("");

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const priceCents = Math.round(parsedPrice * 100);

    if (!Number.isFinite(parsedPrice) || priceCents < 100) {
      setPriceError("Price must be at least $1.00.");
      return;
    }
    setPriceError("");

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 20) {
      setQuantityError("Quantity must be a whole number from 1 to 20.");
      return;
    }
    setQuantityError("");

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const listing = await createListing(
        {
          eventId,
          title,
          priceCents,
          quantity: parsedQuantity,
          notes: notes || undefined
        },
        token
      );
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        const issueText = error.issues?.[0]?.message;
        setErrorMessage(issueText ?? error.message);
      } else {
        setErrorMessage("Could not create listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="grid max-w-5xl gap-6 p-6 sm:p-8">
      <header className="grid gap-2">
        <p className="muted-text text-xs uppercase tracking-[0.18em]">sell tickets</p>
        <h1 className="brand-heading text-3xl font-semibold">Create listing</h1>
        <p className="muted-text text-sm">
          Add clear pricing and transfer details so buyers can decide quickly.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm">
            <span className="muted-text">Find event (title or artist)</span>
            <input
              className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
              onChange={(event) => {
                setEventSearchQuery(event.target.value);
                setEventId("");
                setSelectedEvent(null);
              }}
              disabled={isSubmitting}
              required
              value={eventSearchQuery}
              placeholder="Search artists, event names, city..."
            />
          </label>
          {eventSearchError ? <Alert tone="error">{eventSearchError}</Alert> : null}
          {eventSuggestions.length ? (
            <div className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2">
              {eventSuggestions.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => {
                    setSelectedEvent(event);
                    setEventId(event.id);
                    setEventSearchQuery(event.title);
                    setEventSearchError("");
                  }}
                  className="rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-left transition hover:border-[var(--border)] hover:bg-white/6"
                >
                  <p className="text-sm text-[var(--foreground)]">{event.title}</p>
                  <p className="muted-text text-xs">
                    {event.artists.length ? `${event.artists.join(", ")} - ` : ""}
                    {event.city}
                  </p>
                </button>
              ))}
            </div>
          ) : null}
          {isLoadingEvents ? (
            <p className="muted-text text-xs" role="status" aria-live="polite">
              Searching events...
            </p>
          ) : null}
          <Input
            label="Listing title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="2 GA tickets - instant transfer"
            required
            value={title}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Price per ticket (USD)"
              errorMessage={priceError || undefined}
              min={1}
              onChange={(event) => setPrice(event.target.value)}
              required
              step="0.01"
              type="number"
              value={price}
            />
            <Input
              label="Quantity"
              errorMessage={quantityError || undefined}
              max={20}
              min={1}
              onChange={(event) => setQuantity(event.target.value)}
              required
              type="number"
              value={quantity}
            />
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="muted-text">Notes (optional)</span>
            <textarea
              className="min-h-28 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
              maxLength={600}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Seats, transfer timing, and entry notes."
              value={notes}
              aria-describedby="listing-notes-count"
            />
            <span className="muted-text text-xs" id="listing-notes-count">
              {notes.length}/600 characters
            </span>
          </label>
          {errorMessage ? (
            <Alert tone="error" announce="assertive">
              {errorMessage}
            </Alert>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Publishing..." : "Publish listing"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.push("/listings/mine")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>

        <aside className="grid h-fit gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="muted-text text-xs uppercase tracking-[0.16em]">Preview</p>
          <p className="brand-heading text-base font-semibold">{title || "Listing title"}</p>
          <p className="muted-text text-sm">
            {price ? `$${Number(price || 0).toFixed(2)}` : "$0.00"} x {quantity || "0"} tickets
          </p>
          {selectedEvent ? (
            <p className="muted-text text-sm">
              {selectedEvent.title}
              {selectedEvent.artists.length ? ` - ${selectedEvent.artists.join(", ")}` : ""} -{" "}
              {selectedEvent.city}
            </p>
          ) : (
            <p className="muted-text text-sm">Select an event to preview listing context.</p>
          )}
        </aside>
      </div>
    </SurfaceCard>
  );
}
