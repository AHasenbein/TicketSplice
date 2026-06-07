export interface Event {
  id: string;
  organizerId: string;
  title: string;
  artists: string[];
  venue: string;
  city: string;
  startAt: Date;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
}
