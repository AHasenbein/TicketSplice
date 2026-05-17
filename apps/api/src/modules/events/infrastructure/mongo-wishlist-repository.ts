import type { Collection } from "mongodb";
import { getMongoDb } from "../../../database/mongo.js";
import type {
  WishlistEntry,
  WishlistRepository
} from "../domain/wishlist-repository.js";

interface WishlistDocument extends WishlistEntry {
  _id: string;
}

export class MongoWishlistRepository implements WishlistRepository {
  private collectionPromise: Promise<Collection<WishlistDocument>> | null = null;

  private async getCollection(): Promise<Collection<WishlistDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = getMongoDb().then((db) =>
        db.collection<WishlistDocument>("wishlists")
      );
    }

    return this.collectionPromise;
  }

  async add(userId: string, eventId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: `${userId}:${eventId}` },
      {
        $set: {
          _id: `${userId}:${eventId}`,
          userId,
          eventId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  async remove(userId: string, eventId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ _id: `${userId}:${eventId}` });
  }

  async listEventIdsByUserId(userId: string): Promise<string[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return documents.map((doc) => doc.eventId);
  }
}
