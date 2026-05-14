"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { createEvent } from "@/lib/api/events";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

function toIsoString(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [startAt, setStartAt] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (!startAt) {
      setErrorMessage("Add a valid start date and time.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const created = await createEvent(
        {
          title,
          venue,
          city,
          startAt: toIsoString(startAt),
          description: description || undefined
        },
        token
      );
      router.push(`/events/${created.id}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiClientError ? error.message : "Could not publish event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="grid max-w-2xl gap-4 p-6 sm:p-8">
      <h1 className="brand-heading text-3xl font-semibold">Create house music event</h1>
      <p className="muted-text text-sm">
        Keep event copy house-focused so buyers can quickly discover the right crowd and sound.
      </p>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input
          label="Event title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Deep House Rooftop Session"
          required
          value={title}
        />
        <Input
          label="Venue"
          onChange={(event) => setVenue(event.target.value)}
          placeholder="Skyline Terrace"
          required
          value={venue}
        />
        <Input
          label="City"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Chicago"
          required
          value={city}
        />
        <Input
          label="Start date and time"
          onChange={(event) => setStartAt(event.target.value)}
          required
          type="datetime-local"
          value={startAt}
        />
        <label className="grid gap-1.5 text-sm">
          <span className="muted-text">Description (optional)</span>
          <textarea
            className="min-h-28 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] outline-none transition focus:border-[rgba(62,164,255,0.6)] focus:ring-2 focus:ring-[var(--ring)]"
            maxLength={600}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Lineup, vibe, neighborhood, and ticket transfer details."
            value={description}
          />
        </label>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publishing..." : "Publish event"}
        </Button>
      </form>
      {errorMessage ? <p className="text-danger text-sm">{errorMessage}</p> : null}
    </SurfaceCard>
  );
}
