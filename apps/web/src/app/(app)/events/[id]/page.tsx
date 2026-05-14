import { EventDetail } from "@/components/events/EventDetail";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;

  return (
    <section className="page-shell flex flex-1 flex-col py-12">
      <EventDetail eventId={id} />
    </section>
  );
}
