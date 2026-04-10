// ============================================================
// Centralized Dashboard Types
// ============================================================

export interface DashboardStats {
  applicationsSent: number;
  modulesCompleted: number;
  profileViews: number;
  cvDownloads: number;
  applicationsChange: string;
  modulesChange: string;
  profileViewsChange: string;
  cvDownloadsChange: string;
}

export interface ActivityEntry {
  id: string;
  actionType: string;
  title: string;
  company: string;
  time: string;
  status: string;
}

export interface ApplicationEntry {
  id: string;
  title: string;
  company: string;
  appliedAt: string;
  status: string;
  coverLetter: string | null;
  notes: string | null;
}

export interface UserSettings {
  location: string | null;
  role: string | null;
  bio: string | null;
  emailNotifications: boolean;
  jobAlerts: boolean;
  learningReminders: boolean;
  marketingEmails: boolean;
}

export interface UserProfile {
  fullName: string;
  avatarUrl: string | null;
  email: string;
}
