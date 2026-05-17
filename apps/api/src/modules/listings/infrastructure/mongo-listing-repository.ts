import type { Collection } from "mongodb";
import { getMongoDb } from "../../../database/mongo.js";
import type { Listing } from "../domain/listing.js";
import type { ListingRepository } from "../domain/listing-repository.js";

interface ListingDocument {
  _id: string;
  eventId: string;
  sellerId: string;
  title: string;
  seatType: Listing["seatType"];
  priceCents: number;
  quantity: number;
  notes?: string;
  soldOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MongoListingRepository implements ListingRepository {
  private collectionPromise: Promise<Collection<ListingDocument>> | null = null;

  private async getCollection(): Promise<Collection<ListingDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = getMongoDb().then((db) =>
        db.collection<ListingDocument>("listings")
      );
    }

    return this.collectionPromise;
  }

  async create(listing: Listing): Promise<Listing> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: listing.id },
      {
        $set: this.toDocument(listing)
      },
      { upsert: true }
    );
    return listing;
  }

  async update(listing: Listing): Promise<Listing> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: listing.id },
      {
        $set: this.toDocument(listing)
      }
    );
    return listing;
  }

  async list(): Promise<Listing[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return documents.map((doc) => this.fromDocument(doc));
  }

  async findById(id: string): Promise<Listing | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id: id });
    return document ? this.fromDocument(document) : null;
  }

  private toDocument(listing: Listing): ListingDocument {
    return {
      _id: listing.id,
      eventId: listing.eventId,
      sellerId: listing.sellerId,
      title: listing.title,
      seatType: listing.seatType,
      priceCents: listing.priceCents,
      quantity: listing.quantity,
      notes: listing.notes,
      soldOut: listing.soldOut,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt
    };
  }

  private fromDocument(doc: ListingDocument): Listing {
    return {
      id: doc._id,
      eventId: doc.eventId,
      sellerId: doc.sellerId,
      title: doc.title,
      seatType: doc.seatType,
      priceCents: doc.priceCents,
      quantity: doc.quantity,
      notes: doc.notes,
      soldOut: doc.soldOut,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    };
  }
}
