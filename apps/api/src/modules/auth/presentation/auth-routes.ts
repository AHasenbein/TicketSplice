import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthService } from "../application/auth-service.js";
import { OAuthProviderRegistry } from "../application/oauth-provider-registry.js";
import { OAuthStateStore } from "../application/oauth-state-store.js";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema
} from "./auth-schemas.js";
import { HttpError } from "../../../shared/http-error.js";
import { env } from "../../../config/env.js";

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Bearer token.");
  }

  return authorizationHeader.substring("Bearer ".length);
}

export function createAuthRoutes(
  authService: AuthService,
  oauthProviderRegistry: OAuthProviderRegistry,
  oauthStateStore: OAuthStateStore
): Router {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register({
        email: input.email,
        displayName: input.displayName,
        password: input.password
      });
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

      const state = oauthStateStore.issue();
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

  router.get("/oauth/:provider/callback", async (req, res, _next) => {
    try {
      const provider = req.params.provider;
      if (provider !== "google" && provider !== "apple") {
        throw new HttpError(400, "Unsupported OAuth provider.");
      }

      const code = req.query.code;
      const state = req.query.state;
      if (typeof code !== "string" || typeof state !== "string") {
        throw new HttpError(400, "Missing OAuth callback parameters.");
      }

      oauthStateStore.consumeOrThrow(state);
      const adapter = oauthProviderRegistry.getProvider(provider);
      const identity = await adapter.exchangeCodeForIdentity(code);
      const result = await authService.loginOrRegisterOAuth(provider, identity);

      const redirectUrl = new URL("/auth/oauth/callback", env.APP_WEB_URL);
      redirectUrl.searchParams.set("token", result.token);
      res.redirect(302, redirectUrl.toString());
    } catch (error) {
      const redirectUrl = new URL("/auth/oauth/callback", env.APP_WEB_URL);
      const message =
        error instanceof HttpError ? error.message : "OAuth authentication failed.";
      redirectUrl.searchParams.set("error", message);
      res.redirect(302, redirectUrl.toString());
    }
  });

  router.post("/verify-email", async (req, res, next) => {
    try {
      const input = verifyEmailSchema.parse(req.body);
      const result = await authService.verifyEmail(input.token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/verify-email/resend", async (req, res, next) => {
    try {
      const input = resendVerificationSchema.parse(req.body);
      const result = await authService.resendVerificationEmail(input.email);
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
