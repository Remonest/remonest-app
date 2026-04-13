// ============================================================
// Module Review Types
// ============================================================

export interface ModuleReview {
  id: string;
  moduleId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleReviewRow {
  id: string;
  module_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleReviewWithUser extends ModuleReview {
  userFullName: string | null;
  userAvatar: string | null;
}

export interface ModuleReviewInput {
  moduleId: string;
  rating: number;
  comment?: string;
}

export interface ModuleStats {
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  lessonCount: number;
  materialCount: number;
}
