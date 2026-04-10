import { z } from "zod";

// ============================================================
// Job Search / Filter Params Schema
// Used to validate searchParams in route pages
// ============================================================

export const jobSearchParamsSchema = z.object({
  q: z.string().max(200).optional(),
  type: z.enum(["full-time", "part-time", "project", "freelance"]).optional(),
  location: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type JobSearchParamsInput = z.infer<typeof jobSearchParamsSchema>;
