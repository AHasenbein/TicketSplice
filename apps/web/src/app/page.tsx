import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="page-shell flex flex-1 flex-col py-14 sm:py-20">
        <section className="grid gap-8 sm:gap-10">            
          <div className="grid gap-6 sm:max-w-3xl">
            <h1 className="brand-heading text-4xl font-semibold leading-tight sm:text-5xl">
              Buy and sell event tickets with clean, fast, social coordination.
            </h1>
            <p className="muted-text max-w-2xl text-base leading-relaxed sm:text-lg">
              Ticket Splice keeps the experience simple: no platform buyer/seller
              fees, modern chat-first coordination, and a trusted community vibe
              around every event.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/auth/register">
              <Button>Create account</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost">View account</Button>
            </Link>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-3">
          <SurfaceCard className="p-5">
            <h2 className="brand-heading text-lg font-medium">No platform fees</h2>
            <p className="muted-text mt-2 text-sm leading-6">
              Keep transactions direct between buyers and sellers.
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <h2 className="brand-heading text-lg font-medium">Fast coordination</h2>
            <p className="muted-text mt-2 text-sm leading-6">
              Move from listing to meetup details in a few taps.
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <h2 className="brand-heading text-lg font-medium">Event community</h2>
            <p className="muted-text mt-2 text-sm leading-6">
              Built-in discussions and group activity around each show.
            </p>
          </SurfaceCard>
        </section>
      </main>
    </div>
  );
}
