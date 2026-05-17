import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";
import type { Event } from "../domain/event.js";
import type { EventRepository } from "../domain/event-repository.js";
import type {
  EventFeedProvider,
  ExternalEvent,
  ExternalEventSearchInput
} from "./providers/event-feed-provider.js";

export interface CreateEventInput {
  organizerId: string;
  title: string;
  artists?: string[];
  venue: string;
  city: string;
  startAt: string;
  description?: string;
}

export interface EventResponse {
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

interface ListEventsInput {
  houseOnly?: boolean;
  upcomingOnly?: boolean;
  query?: string;
  artist?: string;
  city?: string;
  limit?: number;
}

export class EventService {
  private lastSyncAt: number | null = null;
  private activeSync: Promise<void> | null = null;
  private topArtistCache: string[] = [];
  private topArtistCacheAt: number | null = null;

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly eventFeedProviders: EventFeedProvider[] = []
  ) {}

  async createEvent(input: CreateEventInput): Promise<EventResponse> {
    const startAt = new Date(input.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new HttpError(400, "Event start date is invalid.");
    }

    const created = await this.eventRepository.create({
      id: crypto.randomUUID(),
      organizerId: input.organizerId,
      title: input.title.trim(),
      artists: this.normalizeArtists(input.artists),
      venue: input.venue.trim(),
      city: input.city.trim(),
      startAt,
      description: input.description?.trim() || undefined,
      createdAt: new Date()
    });

    return this.toResponse(created);
  }

  async listEvents(input: ListEventsInput = {}): Promise<EventResponse[]> {
    if (input.query || input.artist || input.city) {
      await this.pullFromProvidersWithSearch({
        query: input.query,
        artist: input.artist,
        city: input.city,
        limit: Math.max(25, input.limit ?? 40)
      });
    }

    const events = await this.eventRepository.list();
    const now = Date.now();
    const normalizedQuery = input.query?.trim().toLowerCase();
    const normalizedArtist = input.artist?.trim().toLowerCase();
    const normalizedCity = input.city?.trim().toLowerCase();
    const filtered = events
      .filter((event) => (input.upcomingOnly ?? true ? event.startAt.getTime() >= now : true))
      .filter((event) => (input.houseOnly ? this.isHouseEvent(event) : true))
      .filter((event) =>
        normalizedQuery
          ? `${event.title} ${event.venue} ${event.city} ${event.description ?? ""} ${event.artists.join(" ")}`.toLowerCase().includes(normalizedQuery)
          : true
      )
      .filter((event) =>
        normalizedArtist
          ? event.artists.some((artist) => artist.toLowerCase().includes(normalizedArtist))
          : true
      )
      .filter((event) =>
        normalizedCity ? event.city.toLowerCase().includes(normalizedCity) : true
      );

    const limited = input.limit && input.limit > 0 ? filtered.slice(0, input.limit) : filtered;
    return limited.map((event) => this.toResponse(event));
  }

  async getEventById(eventId: string): Promise<EventResponse> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new HttpError(404, "Event not found.");
    }

    return this.toResponse(event);
  }

  async listArtistSuggestions(input: { query?: string; limit?: number } = {}): Promise<string[]> {
    const limit = Math.max(1, Math.min(input.limit ?? 20, 500));
    const normalizedQuery = input.query?.trim().toLowerCase();

    await this.ensureTopArtistCache();

    let suggestions = this.topArtistCache;
    if (normalizedQuery) {
      suggestions = suggestions.filter((artist) => artist.toLowerCase().includes(normalizedQuery));
    }

    if (suggestions.length < limit && normalizedQuery) {
      const providerResults = await Promise.all(
        this.eventFeedProviders.map((provider) =>
          provider.fetchArtistSuggestions?.({ query: normalizedQuery, limit: 100 }) ?? Promise.resolve([])
        )
      );
      const merged = new Set([...this.topArtistCache, ...providerResults.flat()]);
      this.topArtistCache = Array.from(merged).slice(0, 500);
      suggestions = this.topArtistCache.filter((artist) =>
        artist.toLowerCase().includes(normalizedQuery)
      );
    }

    return suggestions.slice(0, limit);
  }

  async syncCurrentHouseEvents(): Promise<void> {
    const now = Date.now();
    if (this.lastSyncAt && now - this.lastSyncAt < 1000 * 60 * 20) {
      return;
    }

    if (this.activeSync) {
      await this.activeSync;
      return;
    }

    this.activeSync = this.pullFromProvidersWithSearch({}).finally(() => {
      this.activeSync = null;
      this.lastSyncAt = Date.now();
    });
    await this.activeSync;
  }

  private async pullFromProvidersWithSearch(searchInput: ExternalEventSearchInput): Promise<void> {
    if (!this.eventFeedProviders.length) {
      return;
    }

    const providerResults = await Promise.all(
      this.eventFeedProviders.map(async (provider) => {
        const events = await provider.fetchUpcomingEvents(searchInput);
        return { provider, events };
      })
    );

    for (const result of providerResults) {
      for (const externalEvent of result.events) {
        await this.persistExternalEvent(result.provider.name, externalEvent);
      }
    }
  }

  private async ensureTopArtistCache(): Promise<void> {
    const now = Date.now();
    if (this.topArtistCacheAt && now - this.topArtistCacheAt < 1000 * 60 * 60 * 12) {
      return;
    }

    const providerResults = await Promise.all(
      this.eventFeedProviders.map((provider) =>
        provider.fetchArtistSuggestions?.({ query: "house", limit: 500 }) ?? Promise.resolve([])
      )
    );

    const eventArtists = (await this.eventRepository.list()).flatMap((event) => event.artists);
    const merged = new Set([...providerResults.flat(), ...eventArtists]);
    this.topArtistCache = Array.from(merged).slice(0, 500);
    this.topArtistCacheAt = now;
  }

  private isHouseEvent(event: Event): boolean {
    const searchable =
      `${event.title} ${event.description ?? ""} ${event.artists.join(" ")}`.toLowerCase();
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
      artists: event.artists,
      venue: event.venue,
      city: event.city,
      startAt: event.startAt.toISOString(),
      description: event.description,
      isHouseMusic: this.isHouseEvent(event),
      createdAt: event.createdAt.toISOString()
    };
  }

  private async persistExternalEvent(providerName: string, externalEvent: ExternalEvent): Promise<void> {
    const startAt = new Date(externalEvent.startAt);
    if (Number.isNaN(startAt.getTime())) {
      return;
    }

    const title = externalEvent.title.trim();
    if (!title) {
      return;
    }

    const description = [externalEvent.description?.trim(), externalEvent.sourceUrl?.trim()]
      .filter(Boolean)
      .join(" ");

    await this.eventRepository.create({
      id: `${providerName}-${externalEvent.externalId}`,
      organizerId: providerName,
      title,
      artists: this.normalizeArtists(externalEvent.artists),
      venue: externalEvent.venue.trim() || "Live Event",
      city: externalEvent.city.trim() || "Unknown",
      startAt,
      description: description || undefined,
      createdAt: new Date()
    });
  }

  private normalizeArtists(input?: string[]): string[] {
    const values = input ?? [];
    const unique = new Set<string>();

    for (const value of values) {
      const normalized = value.trim();
      if (!normalized) {
        continue;
      }
      unique.add(normalized);
    }

    return Array.from(unique).slice(0, 8);
  }
}
