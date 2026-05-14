import { apiRequest } from "./client";

export interface Event {
  id: string;
  organizerId: string;
  title: string;
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

export interface CreateEventInput {
  title: string;
  venue: string;
  city: string;
  startAt: string;
  description?: string;
}

interface ListEventsOptions {
  houseOnly?: boolean;
  upcomingOnly?: boolean;
}

export async function listEvents(options: ListEventsOptions = {}): Promise<Event[]> {
  const houseOnly = options.houseOnly ?? true;
  const upcomingOnly = options.upcomingOnly ?? true;
  const query = new URLSearchParams({
    houseOnly: String(houseOnly),
    upcomingOnly: String(upcomingOnly)
  });

  const response = await apiRequest<EventsResponse>(`/api/v1/events?${query.toString()}`);
  return response.events;
}

export async function getEvent(eventId: string): Promise<Event> {
  const response = await apiRequest<EventResponse>(`/api/v1/events/${eventId}`);
  return response.event;
}

export async function createEvent(input: CreateEventInput, token: string): Promise<Event> {
  const response = await apiRequest<EventResponse>("/api/v1/events", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  return response.event;
}
