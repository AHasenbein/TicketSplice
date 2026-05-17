import type { Purchase } from "./purchase.js";

export interface PurchaseRepository {
  create(purchase: Purchase): Promise<Purchase>;
  listByBuyerId(buyerId: string): Promise<Purchase[]>;
}
