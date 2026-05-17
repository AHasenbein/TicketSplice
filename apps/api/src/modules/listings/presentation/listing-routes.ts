import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { HttpError } from "../../../shared/http-error.js";
import { AuthService } from "../../auth/application/auth-service.js";
import { ListingService } from "../application/listing-service.js";

const createListingSchema = z.object({
  eventId: z.string().min(1).optional(),
  eventTitle: z.string().trim().min(2).max(160).optional(),
  eventArtist: z.string().trim().max(120).optional(),
  eventCity: z.string().trim().max(80).optional(),
  eventStartAt: z.string().datetime().optional(),
  title: z.string().trim().min(2).max(120).optional(),
  seatType: z.enum(["GA", "VIP", "OTHER"]),
  priceCents: z.number().int().min(100),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().trim().max(600).optional()
}).superRefine((value, context) => {
  if (!value.eventId && !value.eventTitle) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select an existing event or enter a new event title.",
      path: ["eventTitle"]
    });
  }
});

const purchaseSchema = z.object({
  quantity: z.number().int().min(1).max(10)
});

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Bearer token.");
  }

  return authorizationHeader.substring("Bearer ".length);
}

export function createListingRoutes(
  listingService: ListingService,
  authService: AuthService
): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const eventId =
        typeof req.query.eventId === "string" && req.query.eventId.length > 0
          ? req.query.eventId
          : undefined;
      const listings = await listingService.listListings({ eventId });
      res.status(200).json({ listings });
    } catch (error) {
      next(error);
    }
  });

  router.get("/mine", async (req, res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const user = await authService.getCurrentUser(token);
      const listings = await listingService.listListings({
        sellerId: user.id,
        includeSoldOut: true
      });
      res.status(200).json({ listings });
    } catch (error) {
      next(error);
    }
  });

  router.get("/market", async (req, res, next) => {
    try {
      const query = typeof req.query.q === "string" ? req.query.q : undefined;
      const artist = typeof req.query.artist === "string" ? req.query.artist : undefined;
      const city = typeof req.query.city === "string" ? req.query.city : undefined;
      const limit =
        typeof req.query.limit === "string" && Number.isFinite(Number(req.query.limit))
          ? Number(req.query.limit)
          : undefined;
      const events = await listingService.listMarketEventSuggestions({ query, artist, city, limit });
      res.status(200).json({ events });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:listingId", async (req, res, next) => {
    try {
      const listing = await listingService.getListingById(req.params.listingId);
      res.status(200).json({ listing });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const user = await authService.getCurrentUser(token);
      const input = createListingSchema.parse(req.body);
      const listing = await listingService.createListing({
        sellerId: user.id,
        eventId: input.eventId,
        eventTitle: input.eventTitle,
        eventArtist: input.eventArtist,
        eventCity: input.eventCity,
        eventStartAt: input.eventStartAt,
        title: input.title,
        seatType: input.seatType,
        priceCents: input.priceCents,
        quantity: input.quantity,
        notes: input.notes
      });
      res.status(201).json({ listing });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:listingId/purchase", async (req, res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const user = await authService.getCurrentUser(token);
      const input = purchaseSchema.parse(req.body);
      const result = await listingService.purchaseListing({
        listingId: req.params.listingId,
        buyerId: user.id,
        quantity: input.quantity
      });
      res.status(200).json(result);
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
