import jwt from "jsonwebtoken";
import { env } from "../../../config/env.js";

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
    return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
  }
}
