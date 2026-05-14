import crypto from "node:crypto";
import { HttpError } from "../../../shared/http-error.js";
import { EventService } from "../../events/application/event-service.js";
import type { Listing } from "../domain/listing.js";
import type { ListingRepository } from "../domain/listing-repository.js";

export interface CreateListingInput {
  eventId: string;
  sellerId: string;
  title: string;
  priceCents: number;
  quantity: number;
  notes?: string;
}

export interface ListingResponse {
  id: string;
  eventId: string;
  sellerId: string;
  title: string;
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
    private readonly eventService: EventService
  ) {}

  async createListing(input: CreateListingInput): Promise<ListingResponse> {
    await this.eventService.getEventById(input.eventId);
    const now = new Date();
    const listing: Listing = {
      id: crypto.randomUUID(),
      eventId: input.eventId,
      sellerId: input.sellerId,
      title: input.title.trim(),
      priceCents: input.priceCents,
      quantity: input.quantity,
      notes: input.notes?.trim() || undefined,
      soldOut: false,
      createdAt: now,
      updatedAt: now
    };

    const created = await this.listingRepository.create(listing);
    return this.toResponse(created);
  }

  async listListings(filters: {
    eventId?: string;
    sellerId?: string;
    includeSoldOut?: boolean;
  }): Promise<ListingResponse[]> {
    const listings = await this.listingRepository.list();
    return listings
      .filter((listing) => (filters.eventId ? listing.eventId === filters.eventId : true))
      .filter((listing) => (filters.sellerId ? listing.sellerId === filters.sellerId : true))
      .filter((listing) => (filters.includeSoldOut ? true : !listing.soldOut))
      .map((listing) => this.toResponse(listing));
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

    return {
      listing: this.toResponse(saved),
      purchasedQuantity: input.quantity,
      totalPriceCents: saved.priceCents * input.quantity,
      message: "Purchase confirmed."
    };
  }

  private toResponse(listing: Listing): ListingResponse {
    return {
      id: listing.id,
      eventId: listing.eventId,
      sellerId: listing.sellerId,
      title: listing.title,
      priceCents: listing.priceCents,
      quantity: listing.quantity,
      notes: listing.notes,
      soldOut: listing.soldOut,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString()
    };
  }
}
