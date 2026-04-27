import { z } from "zod";

// DB enum values from migration CHECK constraint
export const LEARNING_CATEGORIES = [
  "communication",
  "mindset",
  "career",
  "design",
  "productivity",
] as const;

export const LEARNING_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const CONTENT_TYPES = ["article", "video", "exercise", "quiz"] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];
export type LearningLevel = (typeof LEARNING_LEVELS)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

// Human-readable labels for UI
export const CATEGORY_LABELS: Record<string, string> = {
  communication: "Remote Working Basics",
  mindset: "Mindset",
  career: "Skill Freelance",
  design: "Growth & Branding",
  productivity: "Tools & Produktivitas",
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const learningModuleSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  category: z.enum(LEARNING_CATEGORIES),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

export type LearningModuleInput = z.infer<typeof learningModuleSchema>;

export type LearningModuleResult = {
  success: boolean;
  error?: string;
  redirect?: string;
  id?: string;
};

export const moduleContentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  contentType: z.enum(CONTENT_TYPES),
  contentData: z.record(z.string(), z.unknown()).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export type ModuleContentInput = z.infer<typeof moduleContentSchema>;

export const pathURL = `https://remonest-app.vercel.app/`;
