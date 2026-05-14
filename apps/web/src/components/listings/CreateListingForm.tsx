"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { createListing } from "@/lib/api/listings";
import { listEvents } from "@/lib/api/events";
import type { Event } from "@/lib/api/events";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

export function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState(searchParams.get("eventId") ?? "");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      try {
        const response = await listEvents();
        if (!cancelled) {
          setEvents(response);
          if (!eventId && response[0]) {
            setEventId(response[0].id);
          }
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Could not load events for listing.");
        }
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const listing = await createListing(
        {
          eventId,
          title,
          priceCents: Math.round(Number(price) * 100),
          quantity: Number(quantity),
          notes: notes || undefined
        },
        token
      );
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiClientError ? error.message : "Could not create listing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="grid max-w-2xl gap-4 p-6 sm:p-8">
      <h1 className="brand-heading text-3xl font-semibold">Create ticket listing</h1>
      <p className="muted-text text-sm">
        Listings are optimized for house music events and fast verified transfers.
      </p>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1.5 text-sm">
          <span className="muted-text">Event</span>
          <select
            className="h-11 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
            onChange={(selected) => setEventId(selected.target.value)}
            required
            value={eventId}
          >
            <option value="">Select an event</option>
            {events.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} - {item.city}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Listing title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="2 GA tickets - instant transfer"
          required
          value={title}
        />
        <Input
          label="Price per ticket (USD)"
          min={1}
          onChange={(event) => setPrice(event.target.value)}
          required
          step="0.01"
          type="number"
          value={price}
        />
        <Input
          label="Quantity"
          max={20}
          min={1}
          onChange={(event) => setQuantity(event.target.value)}
          required
          type="number"
          value={quantity}
        />
        <Input
          label="Notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Seat info, transfer details, etc."
          value={notes}
        />
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publishing..." : "Publish listing"}
        </Button>
      </form>
      {errorMessage ? <p className="text-danger text-sm">{errorMessage}</p> : null}
    </SurfaceCard>
  );
}
