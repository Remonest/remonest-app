// ============================================================
// Portfolio Types
// ============================================================

export type PortfolioItemType = "certificate" | "project" | "achievement" | "other";

export interface PortfolioItem {
  id: string;
  user_id: string;
  item_type: PortfolioItemType;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  external_url: string | null;
  tags: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePortfolioItemInput {
  item_type: PortfolioItemType;
  title: string;
  description?: string;
  cover_image_url?: string;
  external_url?: string;
  tags?: string[];
  /** Reference to a certificate_id (for item_type = 'certificate') */
  certificate_id?: string;
}

export interface UpdatePortfolioItemInput {
  id: string;
  title?: string;
  description?: string;
  cover_image_url?: string;
  external_url?: string;
  tags?: string[];
  order_index?: number;
  is_published?: boolean;
}
