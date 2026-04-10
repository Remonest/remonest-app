import { z } from "zod";

// ============================================================
// Job Submission Schema — strict validation for publish
// ============================================================

export const jobSubmissionSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter").max(100),
  company: z.string().min(2, "Nama perusahaan minimal 2 karakter").max(100),
  description_html: z.string().min(50, "Deskripsi minimal 50 karakter"),
  job_type: z.enum(["full-time", "part-time", "project", "freelance"]),
  salary_min: z.coerce
    .number()
    .int()
    .min(0, "Gaji minimum tidak valid")
    .optional(),
  salary_max: z.coerce
    .number()
    .int()
    .min(0, "Gaji maksimum tidak valid")
    .optional(),
  salary_currency: z.string().default("IDR"),
  location: z.string().min(1, "Lokasi wajib diisi").max(200),
  apply_method: z.enum(["url", "email"]),
  apply_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
  apply_email: z
    .string()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  deadline: z.coerce
    .date()
    .min(new Date(), "Deadline tidak boleh di masa lalu")
    .optional(),
  duration_estimate: z
    .string()
    .max(100, "Estimasi durasi terlalu panjang")
    .optional(),
});

// ============================================================
// Job Draft Schema — lenient validation for partial saves
// ============================================================

export const jobDraftSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  description_html: z.string().min(1).optional(),
  job_type: z.enum(["full-time", "part-time", "project", "freelance"]).optional(),
  salary_min: z.coerce.number().int().min(0).optional(),
  salary_max: z.coerce.number().int().min(0).optional(),
  salary_currency: z.string().default("IDR"),
  location: z.string().min(1).optional(),
  apply_method: z.enum(["url", "email"]).optional(),
  apply_url: z.string().optional().or(z.literal("")),
  apply_email: z.string().optional().or(z.literal("")),
  deadline: z.coerce.date().optional(),
  duration_estimate: z.string().optional(),
});

// ============================================================
// Job Approval Schema — admin approval with optional rejection reason
// ============================================================

export const jobApprovalSchema = z.object({
  job_id: z.string().uuid(),
  rejection_reason: z
    .string()
    .max(500, "Alasan penolakan maksimal 500 karakter")
    .optional(),
});

// ============================================================
// Type Inference
// ============================================================

export type JobSubmissionInput = z.infer<typeof jobSubmissionSchema>;
export type JobDraftInput = z.infer<typeof jobDraftSchema>;
export type JobApprovalInput = z.infer<typeof jobApprovalSchema>;
