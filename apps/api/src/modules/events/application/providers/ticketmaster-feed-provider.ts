import type {
  EventFeedProvider,
  ArtistSuggestionInput,
  ExternalEvent,
  ExternalEventSearchInput
} from "./event-feed-provider.js";

interface TicketmasterFeedProviderOptions {
  apiKey: string;
  countryCode: string;
  keyword: string;
  city?: string;
  size: number;
}

interface TicketmasterAttraction {
  name?: string;
}

interface TicketmasterVenue {
  name?: string;
  city?: { name?: string };
}

interface TicketmasterEmbedded {
  attractions?: TicketmasterAttraction[];
  venues?: TicketmasterVenue[];
}

interface TicketmasterEvent {
  id?: string;
  name?: string;
  info?: string;
  url?: string;
  dates?: { start?: { dateTime?: string } };
  _embedded?: TicketmasterEmbedded;
}

interface TicketmasterResponse {
  _embedded?: { events?: TicketmasterEvent[] };
}

interface TicketmasterAttractionItem {
  name?: string;
}

interface TicketmasterAttractionResponse {
  _embedded?: { attractions?: TicketmasterAttractionItem[] };
}

export class TicketmasterFeedProvider implements EventFeedProvider {
  name = "ticketmaster";

  constructor(private readonly options: TicketmasterFeedProviderOptions) {}

  async fetchUpcomingEvents(input?: ExternalEventSearchInput): Promise<ExternalEvent[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
      url.searchParams.set("apikey", this.options.apiKey);
      url.searchParams.set("countryCode", this.options.countryCode);
      url.searchParams.set("size", String(input?.limit && input.limit > 0 ? input.limit : this.options.size));
      url.searchParams.set("sort", "date,asc");
      const keyword = input?.artist || input?.query || this.options.keyword;
      if (keyword) {
        url.searchParams.set("keyword", keyword);
      }
      url.searchParams.set("segmentName", "Music");
      const city = input?.city || this.options.city;
      if (city) {
        url.searchParams.set("city", city);
      }

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as TicketmasterResponse;
      const events = payload._embedded?.events ?? [];

      return events.reduce<ExternalEvent[]>((accumulator, event) => {
          const venue = event._embedded?.venues?.[0];
          const startAt = event.dates?.start?.dateTime;
          if (!event.id || !event.name || !startAt) {
            return accumulator;
          }

          const artists =
            event._embedded?.attractions?.map((artist) => artist.name?.trim() ?? "").filter(Boolean) ??
            [];

          accumulator.push({
            externalId: event.id,
            title: event.name.trim(),
            artists,
            venue: venue?.name?.trim() || "Ticketmaster Venue",
            city: venue?.city?.name?.trim() || "Unknown",
            startAt,
            description: event.info?.trim(),
            sourceUrl: event.url
          });

          return accumulator;
        }, []);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchArtistSuggestions(input?: ArtistSuggestionInput): Promise<string[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const targetLimit = Math.max(1, Math.min(input?.limit ?? 50, 500));

    try {
      const url = new URL("https://app.ticketmaster.com/discovery/v2/attractions.json");
      url.searchParams.set("apikey", this.options.apiKey);
      url.searchParams.set("keyword", input?.query?.trim() || this.options.keyword);
      url.searchParams.set("classificationName", "music");
      url.searchParams.set("size", String(Math.min(targetLimit, 200)));
      url.searchParams.set("sort", "name,asc");

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as TicketmasterAttractionResponse;
      const attractions = payload._embedded?.attractions ?? [];
      return attractions
        .map((attraction) => attraction.name?.trim() ?? "")
        .filter(Boolean)
        .slice(0, targetLimit);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }
}
