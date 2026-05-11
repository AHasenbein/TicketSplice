import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().trim(),
  displayName: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(120)
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(120)
});
