import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { HttpError } from "../../../shared/http-error.js";
import { AuthService } from "../../auth/application/auth-service.js";
import { ListingService } from "../application/listing-service.js";

const createListingSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  priceCents: z.number().int().min(100),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().trim().max(600).optional()
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
        title: input.title,
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
