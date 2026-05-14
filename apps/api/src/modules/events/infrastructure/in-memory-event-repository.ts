import type { Event } from "../domain/event.js";
import type { EventRepository } from "../domain/event-repository.js";

export class InMemoryEventRepository implements EventRepository {
  private readonly events = new Map<string, Event>();

  async create(event: Event): Promise<Event> {
    this.events.set(event.id, event);
    return event;
  }

  async list(): Promise<Event[]> {
    return Array.from(this.events.values()).sort(
      (left, right) => left.startAt.getTime() - right.startAt.getTime()
    );
  }

  async findById(id: string): Promise<Event | null> {
    return this.events.get(id) ?? null;
  }
}
