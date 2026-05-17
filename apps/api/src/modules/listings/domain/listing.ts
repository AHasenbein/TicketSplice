export interface Listing {
  id: string;
  eventId: string;
  sellerId: string;
  title: string;
  seatType: "GA" | "VIP" | "OTHER";
  priceCents: number;
  quantity: number;
  notes?: string;
  soldOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}
