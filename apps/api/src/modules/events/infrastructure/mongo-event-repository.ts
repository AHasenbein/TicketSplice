import type { Collection } from "mongodb";
import { getMongoDb } from "../../../database/mongo.js";
import type { Event } from "../domain/event.js";
import type { EventRepository } from "../domain/event-repository.js";

interface EventDocument {
  _id: string;
  organizerId: string;
  title: string;
  artists: string[];
  venue: string;
  city: string;
  startAt: Date;
  description?: string;
  createdAt: Date;
}

export class MongoEventRepository implements EventRepository {
  private collectionPromise: Promise<Collection<EventDocument>> | null = null;

  private async getCollection(): Promise<Collection<EventDocument>> {
    if (!this.collectionPromise) {
      this.collectionPromise = getMongoDb().then((db) =>
        db.collection<EventDocument>("events")
      );
    }

    return this.collectionPromise;
  }

  async create(event: Event): Promise<Event> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: event.id },
      {
        $set: this.toDocument(event)
      },
      { upsert: true }
    );
    return event;
  }

  async list(): Promise<Event[]> {
    const collection = await this.getCollection();
    const documents = await collection.find({}).sort({ startAt: 1 }).toArray();
    return documents.map((doc) => this.fromDocument(doc));
  }

  async findById(id: string): Promise<Event | null> {
    const collection = await this.getCollection();
    const document = await collection.findOne({ _id: id });
    return document ? this.fromDocument(document) : null;
  }

  private toDocument(event: Event): EventDocument {
    return {
      _id: event.id,
      organizerId: event.organizerId,
      title: event.title,
      artists: event.artists,
      venue: event.venue,
      city: event.city,
      startAt: event.startAt,
      description: event.description,
      createdAt: event.createdAt
    };
  }

  private fromDocument(doc: EventDocument): Event {
    return {
      id: doc._id,
      organizerId: doc.organizerId,
      title: doc.title,
      artists: doc.artists,
      venue: doc.venue,
      city: doc.city,
      startAt: new Date(doc.startAt),
      description: doc.description,
      createdAt: new Date(doc.createdAt)
    };
  }
}
