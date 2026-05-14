export interface Event {
  id: string;
  organizerId: string;
  title: string;
  venue: string;
  city: string;
  startAt: Date;
  description?: string;
  createdAt: Date;
}
