"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiClientError } from "@/lib/api/client";
import type { Listing } from "@/lib/api/listings";
import { listMyListings } from "@/lib/api/listings";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Button } from "../ui/Button";
import { SurfaceCard } from "../ui/SurfaceCard";

export function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      const token = readAuthToken();
      if (!token) {
        if (!cancelled) {
          setErrorMessage("Log in to view your listings.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await listMyListings(token);
        if (!cancelled) {
          setListings(response);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Could not load your listings."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <p className="muted-text text-sm">Loading your listings...</p>;
  }

  if (errorMessage) {
    return <p className="text-danger text-sm">{errorMessage}</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between gap-3">
        <h1 className="brand-heading text-3xl font-semibold">My listings</h1>
        <Link href="/listings/new">
          <Button>Create listing</Button>
        </Link>
      </div>
      {listings.length ? (
        listings.map((listing) => (
          <SurfaceCard className="grid gap-2 p-4" elevated={false} key={listing.id}>
            <p className="brand-heading text-lg font-semibold">{listing.title}</p>
            <p className="muted-text text-sm">
              ${(listing.priceCents / 100).toFixed(2)} x {listing.quantity} remaining
            </p>
            <p className={`text-sm ${listing.soldOut ? "text-danger" : "text-success"}`}>
              {listing.soldOut ? "Sold out" : "Active"}
            </p>
          </SurfaceCard>
        ))
      ) : (
        <SurfaceCard className="p-4" elevated={false}>
          <p className="muted-text text-sm">No listings yet.</p>
        </SurfaceCard>
      )}
    </div>
  );
}
