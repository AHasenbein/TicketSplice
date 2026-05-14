import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { HttpError } from "../../../shared/http-error.js";
import { AuthService } from "../../auth/application/auth-service.js";
import { EventService } from "../application/event-service.js";

const createEventSchema = z.object({
  title: z.string().trim().min(2).max(120),
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

export function createEventRoutes(eventService: EventService, authService: AuthService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const houseOnly =
        typeof req.query.houseOnly === "string"
          ? req.query.houseOnly.toLowerCase() !== "false"
          : true;
      const upcomingOnly =
        typeof req.query.upcomingOnly === "string"
          ? req.query.upcomingOnly.toLowerCase() !== "false"
          : true;

      await eventService.syncCurrentHouseEvents();
      const events = await eventService.listEvents({ houseOnly, upcomingOnly });
      res.status(200).json({ events });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:eventId", async (req, res, next) => {
    try {
      await eventService.syncCurrentHouseEvents();
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
      const input = createEventSchema.parse(req.body);

      const event = await eventService.createEvent({
        organizerId: user.id,
        title: input.title,
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
