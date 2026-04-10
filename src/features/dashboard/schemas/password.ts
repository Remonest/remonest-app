import { z } from "zod";

// ============================================================
// Password Update Schema — validates complexity rules
// ============================================================

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((pw) => /[A-Z]/.test(pw), "Must contain at least one uppercase letter")
    .refine((pw) => /[a-z]/.test(pw), "Must contain at least one lowercase letter")
    .refine((pw) => /[0-9]/.test(pw), "Must contain at least one number"),
});

export type PasswordInput = z.infer<typeof passwordSchema>;
