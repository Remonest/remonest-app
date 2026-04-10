import { z } from "zod";

// ============================================================
// Profile Settings Schema
// ============================================================

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  location: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
