import { z } from "zod";

// ============================================================
// Notification Preferences Schema
// ============================================================

export const notificationPrefsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  jobAlerts: z.boolean().default(true),
  learningReminders: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
});

export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;
