import cors from "cors";
import express from "express";
import helmet from "helmet";
import type { NextFunction, Request, Response } from "express";
import { createAuthRoutes } from "./modules/auth/presentation/auth-routes.js";
import { InMemoryUserRepository } from "./modules/auth/infrastructure/in-memory-user-repository.js";
import { SessionService } from "./modules/auth/application/session-service.js";
import { AuthService } from "./modules/auth/application/auth-service.js";
import { OAuthProviderRegistry } from "./modules/auth/application/oauth-provider-registry.js";
import { HttpError } from "./shared/http-error.js";

export function createApp() {
  const app = express();

  const userRepository = new InMemoryUserRepository();
  const sessionService = new SessionService();
  const authService = new AuthService(userRepository, sessionService);
  const oauthProviderRegistry = new OAuthProviderRegistry([]);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1/auth", createAuthRoutes(authService, oauthProviderRegistry));

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
