import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(120)
  .regex(/\d/, "Password must include at least one number.");

export const registerSchema = z.object({
  email: z.email().trim(),
  displayName: z.string().trim().min(2).max(80),
  password: passwordSchema,
  confirmPassword: z.string().max(120)
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match."
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1).max(120)
});

export const verifyEmailSchema = z.object({
  token: z.string().min(20)
});

export const resendVerificationSchema = z.object({
  email: z.email().trim()
});
