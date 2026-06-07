import type { Listing } from "../domain/listing.js";
import type { ListingRepository } from "../domain/listing-repository.js";

export class InMemoryListingRepository implements ListingRepository {
  private readonly listings = new Map<string, Listing>();

  async create(listing: Listing): Promise<Listing> {
    this.listings.set(listing.id, listing);
    return listing;
  }

  async update(listing: Listing): Promise<Listing> {
    this.listings.set(listing.id, listing);
    return listing;
  }

  async delete(id: string): Promise<void> {
    this.listings.delete(id);
  }

  async list(): Promise<Listing[]> {
    return Array.from(this.listings.values()).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
    );
  }

  async findById(id: string): Promise<Listing | null> {
    return this.listings.get(id) ?? null;
  }
}
