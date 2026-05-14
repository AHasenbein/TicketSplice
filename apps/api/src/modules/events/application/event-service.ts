import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";
import type { Event } from "../domain/event.js";
import type { EventRepository } from "../domain/event-repository.js";

export interface CreateEventInput {
  organizerId: string;
  title: string;
  venue: string;
  city: string;
  startAt: string;
  description?: string;
}

export interface EventResponse {
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

interface ListEventsInput {
  houseOnly?: boolean;
  upcomingOnly?: boolean;
}

interface GoabaseParty {
  id: number;
  nameParty: string;
  dateStart: string;
  nameType?: string;
  nameCountry?: string;
  nameTown?: string;
  urlPartyHtml?: string;
}

interface GoabaseResponse {
  partylist?: GoabaseParty[];
}

export class EventService {
  private lastHouseSyncAt: number | null = null;
  private activeHouseSync: Promise<void> | null = null;

  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(input: CreateEventInput): Promise<EventResponse> {
    const startAt = new Date(input.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new HttpError(400, "Event start date is invalid.");
    }

    const created = await this.eventRepository.create({
      id: crypto.randomUUID(),
      organizerId: input.organizerId,
      title: input.title.trim(),
      venue: input.venue.trim(),
      city: input.city.trim(),
      startAt,
      description: input.description?.trim() || undefined,
      createdAt: new Date()
    });

    return this.toResponse(created);
  }

  async listEvents(input: ListEventsInput = {}): Promise<EventResponse[]> {
    const events = await this.eventRepository.list();
    const now = Date.now();
    return events
      .filter((event) => (input.upcomingOnly ?? true ? event.startAt.getTime() >= now : true))
      .filter((event) => (input.houseOnly ? this.isHouseEvent(event) : true))
      .map((event) => this.toResponse(event));
  }

  async getEventById(eventId: string): Promise<EventResponse> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new HttpError(404, "Event not found.");
    }

    return this.toResponse(event);
  }

  async syncCurrentHouseEvents(): Promise<void> {
    const now = Date.now();
    if (this.lastHouseSyncAt && now - this.lastHouseSyncAt < 1000 * 60 * 30) {
      return;
    }

    if (this.activeHouseSync) {
      await this.activeHouseSync;
      return;
    }

    this.activeHouseSync = this.pullFromGoabase().finally(() => {
      this.activeHouseSync = null;
      this.lastHouseSyncAt = Date.now();
    });
    await this.activeHouseSync;
  }

  private async pullFromGoabase(): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const url = new URL("https://www.goabase.net/api/party/json/");
      url.searchParams.set("saAtt[search]", "house");
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as GoabaseResponse;
      const parties = payload.partylist ?? [];

      for (const party of parties.slice(0, 40)) {
        const startAt = new Date(party.dateStart);
        if (Number.isNaN(startAt.getTime())) {
          continue;
        }

        const title = party.nameParty?.trim();
        if (!title) {
          continue;
        }

        const city = party.nameTown?.trim() || party.nameCountry?.trim() || "Unknown";
        const venue = party.nameType?.trim() || "House Music Event";
        const details: string[] = ["Live house music event imported from Goabase."];
        if (party.urlPartyHtml) {
          details.push(`More info: ${party.urlPartyHtml}`);
        }

        await this.eventRepository.create({
          id: `goabase-${party.id}`,
          organizerId: "goabase",
          title,
          venue,
          city,
          startAt,
          description: details.join(" "),
          createdAt: new Date()
        });
      }
    } catch {
      // MVP behavior: if provider fails, keep serving locally-seeded events.
    } finally {
      clearTimeout(timeout);
    }
  }

  private isHouseEvent(event: Event): boolean {
    const searchable = `${event.title} ${event.description ?? ""}`.toLowerCase();
    return [
      "house",
      "tech house",
      "deep house",
      "afro house",
      "progressive house",
      "melodic house"
    ].some((keyword) => searchable.includes(keyword));
  }

  private toResponse(event: Event): EventResponse {
    return {
      id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      venue: event.venue,
      city: event.city,
      startAt: event.startAt.toISOString(),
      description: event.description,
      isHouseMusic: this.isHouseEvent(event),
      createdAt: event.createdAt.toISOString()
    };
  }
}
