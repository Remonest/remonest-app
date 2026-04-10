import { z } from "zod";

// ============================================================
// Register Schema
// ============================================================

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
  workType: z.enum(["client", "user"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.workType !== undefined, {
  message: "Please select a work type",
  path: ["workType"],
});

export type RegisterInput = z.infer<typeof registerSchema>;
