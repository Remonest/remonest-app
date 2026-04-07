import { z } from "zod";

export const LEARNING_CATEGORIES = [
  "Remote Working Basics",
  "Skill Freelance",
  "Keuangan Freelancer",
  "Growth & Branding",
  "Tools & Produktivitas",
  "CV & Personal Branding",
] as const;

export const LEARNING_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const CONTENT_TYPES = [
  "article",
  "video",
  "exercise",
  "quiz",
] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];
export type LearningLevel = (typeof LEARNING_LEVELS)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export const learningModuleSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  category: z.enum(LEARNING_CATEGORIES),
  level: z.enum(LEARNING_LEVELS),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  passingScore: z
    .number()
    .int()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score must be at most 100")
    .default(70),
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
