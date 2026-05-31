export type PurchaseRequestStatus = "pending" | "contacted" | "cancelled";

export interface PurchaseRequest {
  id: string;
  listingId: string;
  eventId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  buyerPhone: string;
  status: PurchaseRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
