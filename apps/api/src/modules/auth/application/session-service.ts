import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";
import { HttpError } from "../../../shared/http-error.js";

export interface AuthTokenPayload {
  userId: string;
}

export class SessionService {
  createToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "7d"
    });
  }

  verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new HttpError(401, "Session token is invalid or expired.");
    }
  }
}
