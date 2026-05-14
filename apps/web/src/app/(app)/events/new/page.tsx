import { CreateEventForm } from "@/components/events/CreateEventForm";

export default function NewEventPage() {
  return (
    <section className="page-shell flex flex-1 flex-col py-12">
      <CreateEventForm />
    </section>
  );
}
