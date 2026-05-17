export interface Purchase {
  id: string;
  listingId: string;
  eventId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  pricePerTicketCents: number;
  totalPriceCents: number;
  createdAt: Date;
}
