import { apiRequest } from "./client";

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  artists: string[];
  venue: string;
  city: string;
  startAt: string;
  description?: string;
  isHouseMusic: boolean;
  createdAt: string;
}

interface EventsResponse {
  events: Event[];
}

interface EventResponse {
  event: Event;
}

interface ArtistSuggestionsResponse {
  artists: string[];
}

export interface CreateEventInput {
  title: string;
  artists?: string[];
  venue: string;
  city: string;
  startAt: string;
  description?: string;
}

interface ListEventsOptions {
  query?: string;
  artist?: string;
  city?: string;
  limit?: number;
}

export async function listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
  const query = new URLSearchParams();
  if (options.query?.trim()) {
    query.set("q", options.query.trim());
  }
  if (options.artist?.trim()) {
    query.set("artist", options.artist.trim());
  }
  if (options.city?.trim()) {
    query.set("city", options.city.trim());
  }
  if (options.limit) {
    query.set("limit", String(options.limit));
  }

  const response = await apiRequest<EventsResponse>(`/api/v1/events?${query.toString()}`);
  return response.events;
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await apiRequest<EventResponse>(`/api/v1/events/${eventId}`);
  return response.event;
}

export async function listArtistSuggestions(query: string, limit = 20): Promise<string[]> {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  params.set("limit", String(limit));
  const response = await apiRequest<ArtistSuggestionsResponse>(
    `/api/v1/events/artists?${params.toString()}`
  );
  return response.artists;
}

export async function createEvent(input: CreateEventInput, token: string): Promise<Event> {
  const response = await apiRequest<EventResponse>("/api/v1/events", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  return response.event;
}
