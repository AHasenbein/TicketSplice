import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import type { User } from "../domain/auth-provider.js";
import type { UserRepository } from "../domain/user-repository.js";
import { HttpError } from "../../../shared/http-error.js";
import { SessionService } from "./session-service.js";

export interface RegisterInput {
  email: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  providers: string[];
  createdAt: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionService: SessionService
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new HttpError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user: User = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      displayName: input.displayName.trim(),
      passwordHash,
      providers: [
        {
          provider: "password",
          providerUserId: normalizedEmail
        }
      ],
      createdAt: new Date()
    };

    const createdUser = await this.userRepository.create(user);
    const token = this.sessionService.createToken({ userId: createdUser.id });

    return {
      token,
      user: this.toUserResponse(createdUser)
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = this.sessionService.createToken({ userId: user.id });

    return {
      token,
      user: this.toUserResponse(user)
    };
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    const payload = this.sessionService.verifyToken(token);
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new HttpError(401, "Session is invalid.");
    }

    return this.toUserResponse(user);
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      providers: user.providers.map((provider) => provider.provider),
      createdAt: user.createdAt.toISOString()
    };
  }
}
