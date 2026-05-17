import type { Metadata } from "next";
import { EventsBrowse } from "@/components/events/EventsBrowse";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Events | Ticket Splice",
  description: "Browse events that currently have tickets listed for sale."
};

export default function EventsPage() {
  return (
    <section className="page-shell flex flex-1 flex-col gap-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="muted-text text-xs uppercase tracking-[0.18em]">marketplace</p>
          <h1 className="brand-heading mt-2 text-3xl font-semibold">Listed events</h1>
          <p className="muted-text mt-2 text-sm">
            Browse only events with active listings.
          </p>
        </div>
        <div className="flex gap-2">
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
