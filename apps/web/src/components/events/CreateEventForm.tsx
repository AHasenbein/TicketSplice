"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { createEvent } from "@/lib/api/events";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

function toIsoString(datetimeLocal: string): string {
  return new Date(datetimeLocal).toISOString();
}

export function CreateEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [artists, setArtists] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [startAt, setStartAt] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [startAtError, setStartAtError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const parsedStartAt = new Date(startAt);
    if (!startAt || Number.isNaN(parsedStartAt.getTime())) {
      setStartAtError("Add a valid start date and time.");
      return;
    }
    setStartAtError("");

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const created = await createEvent(
        {
          title,
          artists: artists
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          venue,
          city,
          startAt: toIsoString(startAt),
          description: description || undefined
        },
        token
      );
      router.push(`/events/${created.id}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        const issueText = error.issues?.[0]?.message;
        setErrorMessage(issueText ?? error.message);
      } else {
        setErrorMessage("Could not publish event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SurfaceCard className="grid max-w-2xl gap-4 p-6 sm:p-8">
      <h1 className="brand-heading text-3xl font-semibold">Create event</h1>
      <p className="muted-text text-sm">
        Add clear lineup and venue details so buyers can quickly understand the event.
      </p>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input
          label="Event title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Rooftop Sunset Session"
          required
          value={title}
        />
        <Input
          label="Artists (comma separated)"
          onChange={(event) => setArtists(event.target.value)}
          placeholder="Lane 8, Nora En Pure"
          value={artists}
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
          errorMessage={startAtError || undefined}
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
            aria-describedby="event-description-count"
          />
          <span className="muted-text text-xs" id="event-description-count">
            {description.length}/600 characters
          </span>
        </label>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Publishing..." : "Publish event"}
        </Button>
      </form>
      {errorMessage ? <Alert tone="error" announce="assertive">{errorMessage}</Alert> : null}
    </SurfaceCard>
  );
}
