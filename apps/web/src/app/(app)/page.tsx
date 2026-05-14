import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function Home() {
  return (
    <section className="page-shell flex flex-1 flex-col py-12 sm:py-16">
      <section className="grid gap-8">
        <div className="grid gap-6">
          <h1 className="brand-heading max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Buy and sell tickets for house music events without marketplace friction.
          </h1>
          <p className="muted-text max-w-2xl text-base leading-relaxed sm:text-lg">
            Ticket Splice is built for the house community: discover current events, post verified
            listings fast, and move tickets in minutes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/events">
              <Button>Browse house events</Button>
            </Link>
            <Link href="/events/new">
              <Button variant="secondary">Add an event</Button>
            </Link>
            <Link href="/listings/new">
              <Button variant="ghost">Sell tickets</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5" elevated={false}>
          <h2 className="brand-heading text-lg font-medium">House-first discovery</h2>
          <p className="muted-text mt-2 text-sm leading-6">
            Current house events are auto-pulled and ready for listing in one tap.
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-5" elevated={false}>
          <h2 className="brand-heading text-lg font-medium">Built for trust</h2>
          <p className="muted-text mt-2 text-sm leading-6">
            Account verification, session checks, and safer handoff patterns.
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-5" elevated={false}>
          <h2 className="brand-heading text-lg font-medium">Designed for quick transfers</h2>
          <p className="muted-text mt-2 text-sm leading-6">
            Mobile-friendly controls and clean interfaces for fast actions.
          </p>
        </SurfaceCard>
      </section>
    </section>
  );
}
