import type { Listing } from "./listing.js";

export interface ListingRepository {
  create(listing: Listing): Promise<Listing>;
  update(listing: Listing): Promise<Listing>;
  delete(id: string): Promise<void>;
  list(): Promise<Listing[]>;
  findById(id: string): Promise<Listing | null>;
}
