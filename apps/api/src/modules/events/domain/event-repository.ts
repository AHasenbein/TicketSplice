import type { Event } from "./event.js";

export interface EventRepository {
  create(event: Event): Promise<Event>;
  list(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
}
