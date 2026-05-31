import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { NextFunction, Request, Response } from "express";
import { createAuthRoutes } from "./modules/auth/presentation/auth-routes.js";
import { MongoUserRepository } from "./modules/auth/infrastructure/mongo-user-repository.js";
import { SessionService } from "./modules/auth/application/session-service.js";
import { AuthService } from "./modules/auth/application/auth-service.js";
import { OAuthProviderRegistry } from "./modules/auth/application/oauth-provider-registry.js";
import { OAuthStateStore } from "./modules/auth/application/oauth-state-store.js";
import { VerificationEmailSender } from "./modules/auth/infrastructure/email-sender.js";
import { GoogleOAuthProvider } from "./modules/auth/infrastructure/google-oauth-provider.js";
import { env } from "./config/env.js";
import { HttpError } from "./shared/http-error.js";
import { EventService } from "./modules/events/application/event-service.js";
import { MongoEventRepository } from "./modules/events/infrastructure/mongo-event-repository.js";
import { createEventRoutes } from "./modules/events/presentation/event-routes.js";
import { MongoListingRepository } from "./modules/listings/infrastructure/mongo-listing-repository.js";
import { ListingService } from "./modules/listings/application/listing-service.js";
import { createListingRoutes } from "./modules/listings/presentation/listing-routes.js";
import { MongoPurchaseRepository } from "./modules/listings/infrastructure/mongo-purchase-repository.js";
import { MongoWishlistRepository } from "./modules/events/infrastructure/mongo-wishlist-repository.js";
import { MongoPurchaseRequestRepository } from "./modules/listings/infrastructure/mongo-purchase-request-repository.js";

export function createApp() {
  const app = express();

  const userRepository = new MongoUserRepository();
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
  const eventRepository = new MongoEventRepository();
  const eventService = new EventService(eventRepository);
  const listingRepository = new MongoListingRepository();
  const purchaseRepository = new MongoPurchaseRepository();
  const purchaseRequestRepository = new MongoPurchaseRequestRepository();
  const listingService = new ListingService(
    listingRepository,
    eventService,
    purchaseRepository,
    purchaseRequestRepository
  );
  const wishlistRepository = new MongoWishlistRepository();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(
    "/api/v1/auth",
    createAuthRoutes(
      authService,
      oauthProviderRegistry,
      oauthStateStore,
      eventService,
      listingService,
      wishlistRepository
    )
  );
  app.use("/api/v1/events", createEventRoutes(eventService, authService, listingService));
  app.use("/api/v1/listings", createListingRoutes(listingService, authService));

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
