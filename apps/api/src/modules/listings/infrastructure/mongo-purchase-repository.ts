import type { Collection } from "mongodb";
import { getMongoDb } from "../../../database/mongo.js";
import type { Purchase } from "../domain/purchase.js";
import type { PurchaseRepository } from "../domain/purchase-repository.js";

interface PurchaseDocument {
  _id: string;
  listingId: string;
  eventId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  pricePerTicketCents: number;
  totalPriceCents: number;
  createdAt: Date;
}

export class MongoPurchaseRepository implements PurchaseRepository {
  private collectionPromise: Promise<Collection<PurchaseDocument>> | null = null;

  private async getCollection(): Promise<Collection<PurchaseDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = getMongoDb().then((db) =>
        db.collection<PurchaseDocument>("purchases")
      );
    }

    return this.collectionPromise;
  }

  async create(purchase: Purchase): Promise<Purchase> {
    const collection = await this.getCollection();
    await collection.insertOne({
      _id: purchase.id,
      listingId: purchase.listingId,
      eventId: purchase.eventId,
      buyerId: purchase.buyerId,
      sellerId: purchase.sellerId,
      quantity: purchase.quantity,
      pricePerTicketCents: purchase.pricePerTicketCents,
      totalPriceCents: purchase.totalPriceCents,
      createdAt: purchase.createdAt
    });
    return purchase;
  }

  async listByBuyerId(buyerId: string): Promise<Purchase[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({ buyerId }).sort({ createdAt: -1 }).toArray();
    return documents.map((doc) => ({
      id: doc._id,
      listingId: doc.listingId,
      eventId: doc.eventId,
      buyerId: doc.buyerId,
      sellerId: doc.sellerId,
      quantity: doc.quantity,
      pricePerTicketCents: doc.pricePerTicketCents,
      totalPriceCents: doc.totalPriceCents,
      createdAt: new Date(doc.createdAt)
    }));
  }
}
