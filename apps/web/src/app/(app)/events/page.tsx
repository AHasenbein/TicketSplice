import Link from "next/link";
import { EventsBrowse } from "@/components/events/EventsBrowse";
import { Button } from "@/components/ui/Button";

export default function EventsPage() {
  return (
    <section className="page-shell flex flex-1 flex-col gap-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="muted-text text-xs uppercase tracking-[0.18em]">house music marketplace</p>
          <h1 className="brand-heading mt-2 text-3xl font-semibold">Current House Events</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/events/new">
            <Button variant="secondary">Add event</Button>
          </Link>
          <Link href="/listings/new">
            <Button>Sell tickets</Button>
          </Link>
          <Link href="/listings/mine">
            <Button variant="secondary">My listings</Button>
          </Link>
        </div>
      </div>
      <EventsBrowse />
    </section>
  );
}
