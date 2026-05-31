import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { HttpError } from "../../../shared/http-error.js";
import { AuthService } from "../../auth/application/auth-service.js";
import { EventService } from "../application/event-service.js";
import { ListingService } from "../../listings/application/listing-service.js";
import { getMongoDb } from "../../../database/mongo.js";
import { assertTrustedSeller } from "../../../shared/trusted-seller.js";

const createEventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  artists: z.array(z.string().trim().min(1).max(80)).max(8).optional(),
  venue: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  startAt: z.string().datetime(),
  description: z.string().trim().max(600).optional()
});

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Bearer token.");
  }

  return authorizationHeader.substring("Bearer ".length);
}

function isLocalhostRequest(req: Request): boolean {
  const host = req.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function createEventRoutes(
  eventService: EventService,
  authService: AuthService,
  listingService: ListingService
): Router {
  const router = Router();

  router.get("/artists", async (req, res, next) => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q : undefined;
      const limit =
        typeof req.query.limit === "string" && Number.isFinite(Number(req.query.limit))
          ? Number(req.query.limit)
          : undefined;
      const artists = await eventService.listArtistSuggestions({ query, limit });
      res.status(200).json({ artists });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q : undefined;
      const city = typeof req.query.city === "string" ? req.query.city : undefined;
      const limit =
        typeof req.query.limit === "string" && Number.isFinite(Number(req.query.limit))
          ? Number(req.query.limit)
          : undefined;
      const activeListings = await listingService.listListings({});
      const activeEventIds = Array.from(new Set(activeListings.map((listing) => listing.eventId)));
      const events = await eventService.listEvents({
        upcomingOnly: true,
        query,
        city,
        limit,
        ids: activeEventIds
      });
      res.status(200).json({ events });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:eventId", async (req, res, next) => {
    try {
      const event = await eventService.getEventById(req.params.eventId);
      res.status(200).json({ event });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const user = await authService.getCurrentUser(token);
      assertTrustedSeller(user.email);
      const input = createEventSchema.parse(req.body);

      const event = await eventService.createEvent({
        organizerId: user.id,
        title: input.title,
        artists: input.artists,
        venue: input.venue,
        city: input.city,
        startAt: input.startAt,
        description: input.description
      });
      res.status(201).json({ event });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/admin/all", async (req, res, next) => {
    try {
      if (!isLocalhostRequest(req)) {
        throw new HttpError(403, "This action is only available on localhost.");
      }

      const token = extractBearerToken(req.headers.authorization);
      await authService.getCurrentUser(token);

      const db = await getMongoDb();
      const [eventsResult, listingsResult, purchasesResult, wishlistsResult, requestsResult] = await Promise.all([
        db.collection("events").deleteMany({}),
        db.collection("listings").deleteMany({}),
        db.collection("purchases").deleteMany({}),
        db.collection("wishlists").deleteMany({}),
        db.collection("purchase_requests").deleteMany({})
      ]);

      res.status(200).json({
        message: "All events and related marketplace data were deleted.",
        deleted: {
          events: eventsResult.deletedCount,
          listings: listingsResult.deletedCount,
          purchases: purchasesResult.deletedCount,
          wishlists: wishlistsResult.deletedCount,
          purchaseRequests: requestsResult.deletedCount
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: "Invalid request body.",
        issues: error.issues
      });
      return;
    }

    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  });

  return router;
}
