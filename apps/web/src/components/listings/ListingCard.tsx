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
      <SurfaceCard
        className="grid aspect-square content-start gap-1 p-3 transition hover:-translate-y-0.5 hover:border-[rgba(34,211,255,0.55)] hover:shadow-[0_18px_38px_rgba(34,211,255,0.22),0_0_0_1px_rgba(255,46,168,0.22)]"
        elevated={false}
      >
        <h3 className="brand-heading line-clamp-2 text-sm font-semibold leading-tight">{listing.title}</h3>
        <p className="muted-text text-[11px]">Seat type: {listing.seatType}</p>
        <p className="text-xs text-white/90">${amount} per ticket</p>
        <p className="muted-text text-xs">
          {listing.quantity} ticket{listing.quantity === 1 ? "" : "s"} remaining
        </p>
      </SurfaceCard>
    </Link>
  );
}
