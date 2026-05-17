import type {
  EventFeedProvider,
  ArtistSuggestionInput,
  ExternalEvent,
  ExternalEventSearchInput
} from "./event-feed-provider.js";

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

export class GoabaseFeedProvider implements EventFeedProvider {
  name = "goabase";

  async fetchUpcomingEvents(input?: ExternalEventSearchInput): Promise<ExternalEvent[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const url = new URL("https://www.goabase.net/api/party/json/");
      url.searchParams.set("saAtt[search]", input?.query || input?.artist || "house");
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as GoabaseResponse;
      const parties = payload.partylist ?? [];

      return parties
        .slice(0, 50)
        .map((party) => {
          const city = party.nameTown?.trim() || party.nameCountry?.trim() || "Unknown";
          const venue = party.nameType?.trim() || "Live Event";
          const description = party.urlPartyHtml
            ? `Imported from Goabase. More info: ${party.urlPartyHtml}`
            : "Imported from Goabase.";
          return {
            externalId: String(party.id),
            title: party.nameParty?.trim() ?? "",
            artists: [],
            venue,
            city,
            startAt: party.dateStart,
            description,
            sourceUrl: party.urlPartyHtml
          } satisfies ExternalEvent;
        })
        .filter((event) => event.title.length > 0);
    } catch {
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchArtistSuggestions(_input?: ArtistSuggestionInput): Promise<string[]> {
    return [];
  }
}
