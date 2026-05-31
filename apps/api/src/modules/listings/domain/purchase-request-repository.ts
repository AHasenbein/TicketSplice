import type { PurchaseRequest } from "./purchase-request.js";

export interface PurchaseRequestRepository {
  create(purchaseRequest: PurchaseRequest): Promise<PurchaseRequest>;
  listByBuyerId(buyerId: string): Promise<PurchaseRequest[]>;
  listBySellerId(sellerId: string): Promise<PurchaseRequest[]>;
}
