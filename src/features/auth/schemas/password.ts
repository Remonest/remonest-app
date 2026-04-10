import { z } from "zod";

// ============================================================
// Forgot Password Schema
// ============================================================

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ============================================================
// Update Password Schema — validates complexity rules
// ============================================================

export const updatePasswordSchema = z.object({
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

// ============================================================
// Resend Confirmation Schema
// ============================================================

export const resendConfirmationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ============================================================
// Type Inference
// ============================================================

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ResendConfirmationInput = z.infer<typeof resendConfirmationSchema>;
