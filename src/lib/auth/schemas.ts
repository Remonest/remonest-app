import { z } from "zod";

// --- Validation Schemas ---

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .refine(
      (pw) => /[A-Z]/.test(pw),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (pw) => /[a-z]/.test(pw),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (pw) => /[0-9]/.test(pw),
      "Password must contain at least one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// --- Type Inference ---

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// --- Shared Types ---

export type AuthResult = {
  success: boolean;
  error?: string;
  redirect?: string;
};
