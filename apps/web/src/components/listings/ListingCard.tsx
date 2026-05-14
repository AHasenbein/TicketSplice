import Link from "next/link";
import type { Listing } from "@/lib/api/listings";
import { SurfaceCard } from "../ui/SurfaceCard";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const amount = (listing.priceCents / 100).toFixed(2);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <SurfaceCard className="grid gap-2 p-4 transition hover:border-white/35" elevated={false}>
        <h3 className="brand-heading text-lg font-semibold">{listing.title}</h3>
        <p className="text-sm text-white/90">${amount} per ticket</p>
        <p className="muted-text text-sm">
          {listing.quantity} ticket{listing.quantity === 1 ? "" : "s"} remaining
        </p>
      </SurfaceCard>
    </Link>
  );
}
