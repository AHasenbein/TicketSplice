import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService } from "../application/auth-service.js";
import { OAuthProviderRegistry } from "../application/oauth-provider-registry.js";
import { loginSchema, registerSchema } from "./auth-schemas.js";
import { HttpError } from "../../../shared/http-error.js";

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Bearer token.");
  }

  return authorizationHeader.substring("Bearer ".length);
}

export function createAuthRoutes(
  authService: AuthService,
  oauthProviderRegistry: OAuthProviderRegistry
): Router {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", async (req, res, next) => {
    try {
      const token = extractBearerToken(req.headers.authorization);
      const user = await authService.getCurrentUser(token);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.get("/oauth/providers", (_req, res) => {
    res.status(200).json({
      providers: oauthProviderRegistry.listProviderSummaries(),
      message: "OAuth providers are planned but not configured yet."
    });
  });

  router.get("/oauth/:provider/start", async (req, res, next) => {
    try {
      const provider = req.params.provider;
      if (provider !== "google" && provider !== "apple") {
        throw new HttpError(400, "Unsupported OAuth provider.");
      }

      const state = `pending-${Date.now()}`;
      const adapter = oauthProviderRegistry.getProvider(provider);
      const authorizationUrl = await adapter.getAuthorizationUrl(state);

      res.status(200).json({
        provider,
        authorizationUrl
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
