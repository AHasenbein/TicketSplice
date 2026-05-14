import { apiRequest } from "./client";

export interface Listing {
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

interface ListingsResponse {
  listings: Listing[];
}

interface ListingResponse {
  listing: Listing;
}

export interface CreateListingInput {
  eventId: string;
  title: string;
  priceCents: number;
  quantity: number;
  notes?: string;
}

export interface PurchaseResult {
  listing: Listing;
  purchasedQuantity: number;
  totalPriceCents: number;
  message: string;
}

export async function listListings(eventId?: string): Promise<Listing[]> {
  const suffix = eventId ? `?eventId=${encodeURIComponent(eventId)}` : "";
  const response = await apiRequest<ListingsResponse>(`/api/v1/listings${suffix}`);
  return response.listings;
}

export async function getListing(listingId: string): Promise<Listing> {
  const response = await apiRequest<ListingResponse>(`/api/v1/listings/${listingId}`);
  return response.listing;
}

export async function listMyListings(token: string): Promise<Listing[]> {
  const response = await apiRequest<ListingsResponse>("/api/v1/listings/mine", { token });
  return response.listings;
}

export async function createListing(input: CreateListingInput, token: string): Promise<Listing> {
  const response = await apiRequest<ListingResponse>("/api/v1/listings", {
    method: "POST",
    token,
    body: JSON.stringify(input)
  });
  return response.listing;
}

export function purchaseListing(
  listingId: string,
  quantity: number,
  token: string
): Promise<PurchaseResult> {
  return apiRequest<PurchaseResult>(`/api/v1/listings/${listingId}/purchase`, {
    method: "POST",
    token,
    body: JSON.stringify({ quantity })
  });
}
