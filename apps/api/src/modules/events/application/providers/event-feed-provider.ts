export interface ExternalEvent {
  externalId: string;
  title: string;
  artists: string[];
  venue: string;
  city: string;
  startAt: string;
  description?: string;
  sourceUrl?: string;
}

export interface ExternalEventSearchInput {
  query?: string;
  artist?: string;
  city?: string;
  limit?: number;
}

export interface ArtistSuggestionInput {
  query?: string;
  limit?: number;
}

export interface EventFeedProvider {
  name: string;
  fetchUpcomingEvents(input?: ExternalEventSearchInput): Promise<ExternalEvent[]>;
  fetchArtistSuggestions?(input?: ArtistSuggestionInput): Promise<string[]>;
}
