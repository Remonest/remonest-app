// ============================================================
// Certificate Types
// ============================================================

export interface CertificateData {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  category: string;
  difficulty: string;
  completedAt: string;
  certificateId: string;
}

export interface CertificateModule {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficultyLevel: string;
}

export interface CertificateProgress {
  module_id: string;
  progress: number;
  started_at: string;
  completed_at: string;
  updated_at: string;
}
