import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),
  displayName: z.string().min(2).max(80),
  password: z.string().min(8).max(120)
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(120)
});
