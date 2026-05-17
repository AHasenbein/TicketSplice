export interface WishlistEntry {
  userId: string;
  eventId: string;
  createdAt: Date;
}

export interface WishlistRepository {
  add(userId: string, eventId: string): Promise<void>;
  remove(userId: string, eventId: string): Promise<void>;
  listEventIdsByUserId(userId: string): Promise<string[]>;
}
