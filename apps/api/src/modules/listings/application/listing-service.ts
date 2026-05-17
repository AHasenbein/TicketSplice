import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";
import { EventService } from "../../events/application/event-service.js";
import type { Listing } from "../domain/listing.js";
import type { ListingRepository } from "../domain/listing-repository.js";
import type { PurchaseRepository } from "../domain/purchase-repository.js";

export interface CreateListingInput {
  eventId?: string;
  eventTitle?: string;
  eventArtist?: string;
  eventCity?: string;
  eventStartAt?: string;
  sellerId: string;
  title?: string;
  seatType: "GA" | "VIP" | "OTHER";
  priceCents: number;
  quantity: number;
  notes?: string;
}

export interface ListingResponse {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCity: string;
  eventStartAt: string;
  sellerId: string;
  title: string;
  seatType: "GA" | "VIP" | "OTHER";
  priceCents: number;
  quantity: number;
  notes?: string;
  soldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseResult {
  listing: ListingResponse;
  totalPriceCents: number;
  purchasedQuantity: number;
  message: string;
}

export class ListingService {
  constructor(
    private readonly listingRepository: ListingRepository,
    private readonly eventService: EventService,
    private readonly purchaseRepository: PurchaseRepository
  ) {}

  async createListing(input: CreateListingInput): Promise<ListingResponse> {
    const event = input.eventId
      ? await this.eventService.getEventById(input.eventId)
      : await this.eventService.findOrCreateEventForListing({
          title: input.eventTitle ?? "",
          artist: input.eventArtist,
          city: input.eventCity,
          startAt: input.eventStartAt,
          sellerId: input.sellerId
        });
    const now = new Date();
    const listing: Listing = {
      id: crypto.randomUUID(),
      eventId: event.id,
      sellerId: input.sellerId,
      title:
        input.title?.trim() ||
        `${event.title} - ${input.seatType} ticket${input.quantity > 1 ? "s" : ""}`,
      seatType: input.seatType,
      priceCents: input.priceCents,
      quantity: input.quantity,
      notes: input.notes?.trim() || undefined,
      soldOut: false,
      createdAt: now,
      updatedAt: now
    };

    const created = await this.listingRepository.create(listing);
    return this.toResponse(created, event);
  }

  async listListings(filters: {
    eventId?: string;
    sellerId?: string;
    includeSoldOut?: boolean;
  }): Promise<ListingResponse[]> {
    const listings = await this.listingRepository.list();
    const filtered = listings
      .filter((listing) => (filters.eventId ? listing.eventId === filters.eventId : true))
      .filter((listing) => (filters.sellerId ? listing.sellerId === filters.sellerId : true))
      .filter((listing) => (filters.includeSoldOut ? true : !listing.soldOut));
    return Promise.all(filtered.map((listing) => this.toResponse(listing)));
  }

  async getListingById(listingId: string): Promise<ListingResponse> {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      throw new HttpError(404, "Listing not found.");
    }

    return this.toResponse(listing);
  }

  async purchaseListing(input: {
    listingId: string;
    buyerId: string;
    quantity: number;
  }): Promise<PurchaseResult> {
    const listing = await this.listingRepository.findById(input.listingId);
    if (!listing) {
      throw new HttpError(404, "Listing not found.");
    }

    if (listing.sellerId === input.buyerId) {
      throw new HttpError(400, "You cannot buy your own listing.");
    }

    if (listing.soldOut || listing.quantity < input.quantity) {
      throw new HttpError(400, "Not enough tickets available.");
    }

    const updatedListing: Listing = {
      ...listing,
      quantity: listing.quantity - input.quantity,
      soldOut: listing.quantity - input.quantity === 0,
      updatedAt: new Date()
    };
    const saved = await this.listingRepository.update(updatedListing);
    await this.purchaseRepository.create({
      id: crypto.randomUUID(),
      listingId: saved.id,
      eventId: saved.eventId,
      buyerId: input.buyerId,
      sellerId: saved.sellerId,
      quantity: input.quantity,
      pricePerTicketCents: saved.priceCents,
      totalPriceCents: saved.priceCents * input.quantity,
      createdAt: new Date()
    });

    return {
      listing: await this.toResponse(saved),
      purchasedQuantity: input.quantity,
      totalPriceCents: saved.priceCents * input.quantity,
      message: "Purchase confirmed."
    };
  }

  private async toResponse(listing: Listing, eventInput?: Awaited<ReturnType<EventService["getEventById"]>>): Promise<ListingResponse> {
    const event = eventInput ?? (await this.eventService.getEventById(listing.eventId));
    return {
      id: listing.id,
      eventId: listing.eventId,
      eventTitle: event.title,
      eventCity: event.city,
      eventStartAt: event.startAt,
      sellerId: listing.sellerId,
      title: listing.title,
      seatType: listing.seatType,
      priceCents: listing.priceCents,
      quantity: listing.quantity,
      notes: listing.notes,
      soldOut: listing.soldOut,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString()
    };
  }

  async listMarketEventSuggestions(input: {
    query?: string;
    artist?: string;
    city?: string;
    limit?: number;
  }): Promise<
    Array<{
      eventId: string;
      title: string;
      city: string;
      startAt: string;
      artists: string[];
      activeListingCount: number;
      currentPriceCents: number;
    }>
  > {
    const listings = await this.listListings({});
    const grouped = new Map<
      string,
      {
        event: Awaited<ReturnType<EventService["getEventById"]>>;
        listingCount: number;
        lowestPrice: number;
      }
    >();

    for (const listing of listings) {
      const existing = grouped.get(listing.eventId);
      if (existing) {
        existing.listingCount += 1;
        existing.lowestPrice = Math.min(existing.lowestPrice, listing.priceCents);
        continue;
      }

      const event = await this.eventService.getEventById(listing.eventId);
      grouped.set(listing.eventId, {
        event,
        listingCount: 1,
        lowestPrice: listing.priceCents
      });
    }

    const normalizedQuery = input.query?.trim().toLowerCase();
    const normalizedArtist = input.artist?.trim().toLowerCase();
    const normalizedCity = input.city?.trim().toLowerCase();
    const limit = Math.max(1, Math.min(input.limit ?? 10, 50));

    return Array.from(grouped.entries())
      .map(([eventId, value]) => ({
        eventId,
        title: value.event.title,
        city: value.event.city,
        startAt: value.event.startAt,
        artists: value.event.artists,
        activeListingCount: value.listingCount,
        currentPriceCents: value.lowestPrice
      }))
      .filter((item) =>
        normalizedQuery
          ? `${item.title} ${item.artists.join(" ")}`.toLowerCase().includes(normalizedQuery)
          : true
      )
      .filter((item) =>
        normalizedArtist
          ? item.artists.some((artist) => artist.toLowerCase().includes(normalizedArtist))
          : true
      )
      .filter((item) => (normalizedCity ? item.city.toLowerCase().includes(normalizedCity) : true))
      .slice(0, limit);
  }

  async listBoughtEvents(buyerId: string): Promise<
    Array<{
      eventId: string;
      eventTitle: string;
      city: string;
      totalSpentCents: number;
      totalTickets: number;
    }>
  > {
    const purchases = await this.purchaseRepository.listByBuyerId(buyerId);
    const grouped = new Map<
      string,
      {
        eventTitle: string;
        city: string;
        totalSpentCents: number;
        totalTickets: number;
      }
    >();

    for (const purchase of purchases) {
      const event = await this.eventService.getEventById(purchase.eventId);
      const existing = grouped.get(purchase.eventId);
      if (existing) {
        existing.totalSpentCents += purchase.totalPriceCents;
        existing.totalTickets += purchase.quantity;
      } else {
        grouped.set(purchase.eventId, {
          eventTitle: event.title,
          city: event.city,
          totalSpentCents: purchase.totalPriceCents,
          totalTickets: purchase.quantity
        });
      }
    }

    return Array.from(grouped.entries()).map(([eventId, value]) => ({
      eventId,
      eventTitle: value.eventTitle,
      city: value.city,
      totalSpentCents: value.totalSpentCents,
      totalTickets: value.totalTickets
    }));
  }
}
