import type { Metadata } from "next";
import { CreateEventForm } from "@/components/events/CreateEventForm";

export const metadata: Metadata = {
  title: "Create Event | Ticket Splice",
  description: "Publish a new event to the Ticket Splice marketplace."
};

export default function NewEventPage() {
  return (
    <section className="page-shell flex flex-1 flex-col py-12">
      <CreateEventForm />
    </section>
  );
}
