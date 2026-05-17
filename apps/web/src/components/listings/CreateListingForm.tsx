"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { createListing, listMarketEventSuggestions } from "@/lib/api/listings";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

function toDateTimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function toIsoFromDateTimeLocal(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function CreateListingForm() {
  const router = useRouter();
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [eventTitle, setEventTitle] = useState("");
  const [eventArtist, setEventArtist] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [debouncedEventTitle, setDebouncedEventTitle] = useState("");
  const [debouncedEventArtist, setDebouncedEventArtist] = useState("");
  const [debouncedEventCity, setDebouncedEventCity] = useState("");
  const [seatType, setSeatType] = useState<"GA" | "VIP" | "OTHER">("GA");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [marketPriceCents, setMarketPriceCents] = useState<number | null>(null);
  const [eventSuggestions, setEventSuggestions] = useState<
    Array<{
      eventId: string;
      title: string;
      city: string;
      startAt: string;
      artists: string[];
      activeListingCount: number;
      currentPriceCents: number;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [priceError, setPriceError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [eventTitleError, setEventTitleError] = useState("");
  const [eventDateTimeError, setEventDateTimeError] = useState("");

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedEventTitle(eventTitle.trim());
      setDebouncedEventArtist(eventArtist.trim());
      setDebouncedEventCity(eventCity.trim());
    }, 450);

    return () => {
      clearTimeout(timeout);
    };
  }, [eventTitle, eventArtist, eventCity]);

  useEffect(() => {
    let cancelled = false;
    async function loadEventSuggestions() {
      if (!debouncedEventTitle) {
        setEventSuggestions([]);
        setMarketPriceCents(null);
        setEventId(undefined);
        return;
      }

      try {
        const response = await listMarketEventSuggestions({
          query: debouncedEventTitle,
          artist: debouncedEventArtist || undefined,
          city: debouncedEventCity || undefined,
          limit: 8
        });
        if (!cancelled) {
          setEventSuggestions(response);
          const exactMatch = response.find(
            (item) =>
              item.title.toLowerCase() === debouncedEventTitle.toLowerCase() &&
              (debouncedEventCity
                ? item.city.toLowerCase() === debouncedEventCity.toLowerCase()
                : true)
          );
          setMarketPriceCents(exactMatch?.currentPriceCents ?? null);
          if (exactMatch) {
            setEventId(exactMatch.eventId);
            setEventDateTime(toDateTimeLocalValue(exactMatch.startAt));
          } else {
            setEventId(undefined);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load events for listing."
          );
        }
      }
    }

    void loadEventSuggestions();
    return () => {
      cancelled = true;
    };
  }, [debouncedEventTitle, debouncedEventArtist, debouncedEventCity]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (!eventTitle.trim()) {
      setEventTitleError("Event title is required.");
      return;
    }
    setEventTitleError("");
    const eventStartAtIso = toIsoFromDateTimeLocal(eventDateTime);
    if (!eventStartAtIso) {
      setEventDateTimeError("Event date and time are required.");
      return;
    }
    setEventDateTimeError("");

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
          eventTitle: eventTitle.trim(),
          eventArtist: eventArtist.trim() || undefined,
          eventCity: eventCity.trim() || undefined,
          eventStartAt: eventStartAtIso,
          seatType,
          priceCents,
          quantity: parsedQuantity,
          title: undefined
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
    <SurfaceCard className="grid max-w-3xl gap-6 p-6 sm:p-8">
      <header className="grid gap-2">
        <p className="muted-text text-xs uppercase tracking-[0.18em]">sell tickets</p>
        <h1 className="brand-heading text-3xl font-semibold">List tickets</h1>
        <p className="muted-text text-sm">
          Type an event name, set seat type and price, then publish.
        </p>
      </header>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            label="Event"
            onChange={(event) => {
              setEventTitle(event.target.value);
              setEventId(undefined);
            }}
            required
            value={eventTitle}
            placeholder="Event name"
            errorMessage={eventTitleError || undefined}
          />
          <Input
            label="Artist (optional)"
            onChange={(event) => setEventArtist(event.target.value)}
            value={eventArtist}
            placeholder="Artist name"
          />
          <Input
            label="City (optional)"
            onChange={(event) => setEventCity(event.target.value)}
            value={eventCity}
            placeholder="City"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Event date"
            type="date"
            required
            value={eventDateTime ? eventDateTime.slice(0, 10) : ""}
            onChange={(event) => {
              const currentTime = eventDateTime.includes("T")
                ? eventDateTime.slice(11, 16)
                : "19:00";
              setEventDateTime(`${event.target.value}T${currentTime}`);
            }}
            errorMessage={eventDateTimeError || undefined}
          />
          <Input
            label="Event time"
            type="time"
            required
            value={eventDateTime.includes("T") ? eventDateTime.slice(11, 16) : ""}
            onChange={(event) => {
              const currentDate = eventDateTime.includes("T")
                ? eventDateTime.slice(0, 10)
                : "";
              if (!currentDate) {
                setEventDateTimeError("Set a date before selecting time.");
                return;
              }
              setEventDateTime(`${currentDate}T${event.target.value}`);
              setEventDateTimeError("");
            }}
          />
        </div>
        {eventSuggestions.length ? (
          <div className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-2">
            <p className="muted-text px-2 pt-1 text-xs uppercase tracking-[0.14em]">
              Selling now
            </p>
            {eventSuggestions.map((eventSuggestion) => (
              <button
                key={eventSuggestion.eventId}
                type="button"
                onClick={() => {
                  setEventId(eventSuggestion.eventId);
                  setEventTitle(eventSuggestion.title);
                  setEventCity(eventSuggestion.city);
                  setEventDateTime(toDateTimeLocalValue(eventSuggestion.startAt));
                  setMarketPriceCents(eventSuggestion.currentPriceCents);
                }}
                className="rounded-[var(--radius-sm)] border border-transparent px-3 py-2 text-left transition hover:border-[var(--border)] hover:bg-white/6"
              >
                <p className="text-sm text-[var(--foreground)]">{eventSuggestion.title}</p>
                <p className="muted-text text-xs">
                  {eventSuggestion.city} - from $
                  {(eventSuggestion.currentPriceCents / 100).toFixed(2)} (
                  {eventSuggestion.activeListingCount} listings)
                </p>
              </button>
            ))}
          </div>
        ) : null}
        <label className="grid gap-1.5 text-sm">
          <span className="muted-text">Seat type</span>
          <select
            value={seatType}
            onChange={(event) => setSeatType(event.target.value as "GA" | "VIP" | "OTHER")}
            className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="GA">GA</option>
            <option value="VIP">VIP</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
        {marketPriceCents ? (
          <Alert tone="info">
            Current market floor: ${(marketPriceCents / 100).toFixed(2)} per ticket.
          </Alert>
        ) : (
          <Alert tone="info">
            No existing market data for this event yet. Your price will set the first reference.
          </Alert>
        )}
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
    </SurfaceCard>
  );
}
