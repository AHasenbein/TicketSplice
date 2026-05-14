export interface Event {
  id: string;
  organizerId: string;
  title: string;
  artists: string[];
  venue: string;
  city: string;
  startAt: Date;
  description?: string;
  createdAt: Date;
}
