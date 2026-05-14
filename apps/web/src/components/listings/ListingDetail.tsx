"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiClientError } from "@/lib/api/client";
import { getListing, purchaseListing } from "@/lib/api/listings";
import type { Listing } from "@/lib/api/listings";
import { readAuthToken } from "@/lib/auth/token-storage";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ButtonLink } from "../ui/ButtonLink";
import { Input } from "../ui/Input";
import { SurfaceCard } from "../ui/SurfaceCard";

interface ListingDetailProps {
  listingId: string;
}

export function ListingDetail({ listingId }: ListingDetailProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      try {
        const response = await getListing(listingId);
        if (!cancelled) {
          setListing(response);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof ApiClientError ? error.message : "Unable to load listing."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadListing();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const total = useMemo(() => {
    const parsedQuantity = Number(quantity);
    if (!listing || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return 0;
    }
    return (listing.priceCents * parsedQuantity) / 100;
  }, [listing, quantity]);

  async function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = readAuthToken();
    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (!listing) {
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setErrorMessage("Enter a valid ticket quantity.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");
    try {
      const result = await purchaseListing(listing.id, parsedQuantity, token);
      setListing(result.listing);
      setMessage(
        `${result.message} You bought ${result.purchasedQuantity} ticket${
          result.purchasedQuantity === 1 ? "" : "s"
        }.`
      );
    } catch (error) {
      setErrorMessage(error instanceof ApiClientError ? error.message : "Purchase failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="muted-text text-sm" role="status" aria-live="polite">
        Loading listing...
      </p>
    );
  }

  if (errorMessage && !listing) {
    return <Alert tone="error" announce="assertive">{errorMessage}</Alert>;
  }

  if (!listing) {
    return <p className="muted-text text-sm">Listing not found.</p>;
  }

  return (
    <SurfaceCard className="grid max-w-xl gap-4 p-6 sm:p-8">
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/listings/mine" className="muted-text underline underline-offset-4">
          My listings
        </Link>
        <span className="muted-text">/</span>
        <span className="muted-text">Listing details</span>
      </nav>
      <h1 className="brand-heading text-3xl font-semibold">{listing.title}</h1>
      <p className="muted-text text-sm">
        For event:{" "}
        <Link
          href={`/events/${listing.eventId}`}
          className="text-[var(--foreground)] underline underline-offset-4"
        >
          {listing.eventTitle}
        </Link>{" "}
        in {listing.eventCity}
      </p>
      <p className="muted-text text-sm">
        Event time: {new Date(listing.eventStartAt).toLocaleString()}
      </p>
      <p className="text-sm text-white/90">${(listing.priceCents / 100).toFixed(2)} per ticket</p>
      <p className="muted-text text-sm">
        {listing.quantity} ticket{listing.quantity === 1 ? "" : "s"} available
      </p>
      {listing.notes ? <p className="muted-text text-sm">{listing.notes}</p> : null}

      <form className="grid gap-3" onSubmit={handlePurchase}>
        <Input
          label="Tickets to buy"
          max={Math.max(1, listing.quantity)}
          min={1}
          onChange={(event) => setQuantity(event.target.value)}
          required
          type="number"
          value={quantity}
        />
        <p className="muted-text text-sm">Total: ${total.toFixed(2)}</p>
        <Button disabled={isSubmitting || listing.soldOut || listing.quantity <= 0} type="submit">
          {isSubmitting ? "Processing..." : "Buy tickets"}
        </Button>
      </form>
      {message ? <Alert tone="success">{message}</Alert> : null}
      {message ? (
        <ButtonLink href="/listings/mine" variant="secondary" className="h-9 px-3">
          Return to my listings
        </ButtonLink>
      ) : null}
      {errorMessage ? <Alert tone="error" announce="assertive">{errorMessage}</Alert> : null}
    </SurfaceCard>
  );
}
