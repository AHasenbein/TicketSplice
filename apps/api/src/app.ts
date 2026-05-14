import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { NextFunction, Request, Response } from "express";
import { createAuthRoutes } from "./modules/auth/presentation/auth-routes.js";
import { InMemoryUserRepository } from "./modules/auth/infrastructure/in-memory-user-repository.js";
import { SessionService } from "./modules/auth/application/session-service.js";
import { AuthService } from "./modules/auth/application/auth-service.js";
import { OAuthProviderRegistry } from "./modules/auth/application/oauth-provider-registry.js";
import { OAuthStateStore } from "./modules/auth/application/oauth-state-store.js";
import { VerificationEmailSender } from "./modules/auth/infrastructure/email-sender.js";
import { GoogleOAuthProvider } from "./modules/auth/infrastructure/google-oauth-provider.js";
import { env } from "./config/env.js";
import { HttpError } from "./shared/http-error.js";
import { EventService } from "./modules/events/application/event-service.js";
import { InMemoryEventRepository } from "./modules/events/infrastructure/in-memory-event-repository.js";
import { createEventRoutes } from "./modules/events/presentation/event-routes.js";
import { InMemoryListingRepository } from "./modules/listings/infrastructure/in-memory-listing-repository.js";
import { ListingService } from "./modules/listings/application/listing-service.js";
import { createListingRoutes } from "./modules/listings/presentation/listing-routes.js";

export function createApp() {
  const app = express();

  const userRepository = new InMemoryUserRepository();
  const sessionService = new SessionService();
  const emailSender = new VerificationEmailSender();
  const authService = new AuthService(userRepository, sessionService, emailSender);
  const oauthStateStore = new OAuthStateStore();
  const oauthProviderRegistry = new OAuthProviderRegistry(
    env.GOOGLE_OAUTH_CLIENT_ID &&
      env.GOOGLE_OAUTH_CLIENT_SECRET &&
      env.GOOGLE_OAUTH_REDIRECT_URI
      ? [new GoogleOAuthProvider()]
      : []
  );
  const eventRepository = new InMemoryEventRepository();
  const eventService = new EventService(eventRepository);
  const listingRepository = new InMemoryListingRepository();
  const listingService = new ListingService(listingRepository, eventService);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(
    "/api/v1/auth",
    createAuthRoutes(authService, oauthProviderRegistry, oauthStateStore)
  );
  app.use("/api/v1/events", createEventRoutes(eventService, authService));
  app.use("/api/v1/listings", createListingRoutes(listingService, authService));

  void (async () => {
    const rooftopEvent = await eventService.createEvent({
      organizerId: "system-seed",
      title: "Chicago Rooftop House Session",
      artists: ["Nora En Pure", "Lane 8"],
      venue: "Navy Pier Skyline Stage",
      city: "Chicago",
      startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      description: "Sunset-only deep house and melodic house takeover."
    });
    const warehouseEvent = await eventService.createEvent({
      organizerId: "system-seed",
      title: "Warehouse Afterhours: Tech House",
      artists: ["Fisher", "Cloonee"],
      venue: "West Loop Warehouse",
      city: "Chicago",
      startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      description: "Late-night house cuts with rotating local DJs."
    });

    await listingService.createListing({
      eventId: rooftopEvent.id,
      sellerId: "system-seller",
      title: "2x GA rooftop entry",
      priceCents: 5500,
      quantity: 2,
      notes: "Mobile transfer, instant after payment."
    });
    await listingService.createListing({
      eventId: warehouseEvent.id,
      sellerId: "system-seller",
      title: "4x afterhours bundle",
      priceCents: 4700,
      quantity: 4,
      notes: "Entry before midnight included."
    });

    await eventService.syncCurrentHouseEvents();
  })().catch(() => undefined);

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    res.status(500).json({
      message: "Unexpected server error."
    });
  });

  return app;
}
