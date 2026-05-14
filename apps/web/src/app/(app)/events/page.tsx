import type { Metadata } from "next";
import { EventsBrowse } from "@/components/events/EventsBrowse";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Events | Ticket Splice",
  description: "Browse current and upcoming events."
};

export default function EventsPage() {
  return (
    <section className="page-shell flex flex-1 flex-col gap-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="muted-text text-xs uppercase tracking-[0.18em]">marketplace</p>
          <h1 className="brand-heading mt-2 text-3xl font-semibold">Current Events</h1>
          <p className="muted-text mt-2 text-sm">
            Showing curated upcoming events by default. Toggle filters below to broaden the view.
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/events/new" variant="secondary">
            Add event
          </ButtonLink>
          <ButtonLink href="/listings/new">Sell tickets</ButtonLink>
          <ButtonLink href="/listings/mine" variant="secondary">
            My listings
          </ButtonLink>
        </div>
      </div>
      <EventsBrowse />
    </section>
  );
}
