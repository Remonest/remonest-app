"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreatePortfolioItemInput,
  PortfolioItem,
  UpdatePortfolioItemInput,
} from "../types/portfolio";

// ============================================================
// Public: Get user profile by ID (for public portfolio page)
// ============================================================

export async function getUserProfilePublic(
  userId: string
): Promise<{ full_name: string | null; avatar_url: string | null; headline: string | null; location: string | null; website: string | null; bio: string | null } | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url, headline, location, website, bio")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// ============================================================
// Portfolio Actions
// ============================================================

function mapDbToPortfolioItem(row: Record<string, unknown>): PortfolioItem {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    item_type: row.item_type as PortfolioItem["item_type"],
    title: row.title as string,
    description: row.description as string | null,
    cover_image_url: row.cover_image_url as string | null,
    external_url: row.external_url as string | null,
    tags: (row.tags as string[]) || [],
    order_index: row.order_index as number,
    is_published: row.is_published as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// ============================================================
// Get all portfolio items for the authenticated user
// ============================================================

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Failed to fetch portfolio items:", error);
    return [];
  }

  return data.map(mapDbToPortfolioItem);
}

// ============================================================
// Get a single portfolio item by ID (must belong to user)
// ============================================================

export async function getPortfolioItemById(
  itemId: string
): Promise<PortfolioItem | null> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return mapDbToPortfolioItem(data);
}

// ============================================================
// Create a new portfolio item
// ============================================================

export async function createPortfolioItem(
  input: CreatePortfolioItemInput
): Promise<{ success: boolean; error?: string; item?: PortfolioItem }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Get max order_index for this user to append at the end
  const { data: maxOrder } = await supabase
    .from("portfolio_items")
    .select("order_index")
    .eq("user_id", user.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrderIndex = maxOrder ? (maxOrder.order_index as number) + 1 : 0;

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      user_id: user.id,
      item_type: input.item_type,
      title: input.title,
      description: input.description || null,
      cover_image_url: input.cover_image_url || null,
      external_url: input.external_url || null,
      tags: input.tags || [],
      order_index: nextOrderIndex,
      is_published: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create portfolio item:", error);
    return { success: false, error: error.message };
  }

  return { success: true, item: mapDbToPortfolioItem(data) };
}

// ============================================================
// Add a certificate to portfolio (shortcut for certificate type)
// ============================================================

export async function addCertificateToPortfolio(
  certificateId: string,
  moduleTitle: string,
  difficulty: string
): Promise<{ success: boolean; error?: string; item?: PortfolioItem; alreadyExists?: boolean }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Check if this certificate is already in the user's portfolio
  const { data: existing } = await supabase
    .from("portfolio_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", "certificate")
    .eq("external_url", `/certificates/${certificateId}`)
    .single();

  if (existing) {
    return { success: true, alreadyExists: true };
  }

  // Get max order_index for this user
  const { data: maxOrder } = await supabase
    .from("portfolio_items")
    .select("order_index")
    .eq("user_id", user.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrderIndex = maxOrder ? (maxOrder.order_index as number) + 1 : 0;

  const { data, error } = await supabase
    .from("portfolio_items")
    .insert({
      user_id: user.id,
      item_type: "certificate",
      title: moduleTitle,
      description: `Certificate of Completion — ${difficulty} level`,
      cover_image_url: null,
      external_url: `/certificates/${certificateId}`,
      tags: ["certificate", difficulty],
      order_index: nextOrderIndex,
      is_published: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to add certificate to portfolio:", error);
    return { success: false, error: error.message };
  }

  return { success: true, item: mapDbToPortfolioItem(data) };
}

// ============================================================
// Update a portfolio item
// ============================================================

export async function updatePortfolioItem(
  input: UpdatePortfolioItemInput
): Promise<{ success: boolean; error?: string; item?: PortfolioItem }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("portfolio_items")
    .select("id")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { success: false, error: "Portfolio item not found or not yours" };
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.cover_image_url !== undefined) updateData.cover_image_url = input.cover_image_url;
  if (input.external_url !== undefined) updateData.external_url = input.external_url;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.order_index !== undefined) updateData.order_index = input.order_index;
  if (input.is_published !== undefined) updateData.is_published = input.is_published;

  const { data, error } = await supabase
    .from("portfolio_items")
    .update(updateData)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update portfolio item:", error);
    return { success: false, error: error.message };
  }

  return { success: true, item: mapDbToPortfolioItem(data) };
}

// ============================================================
// Delete a portfolio item
// ============================================================

export async function deletePortfolioItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete portfolio item:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Get published portfolio items for a specific user (public, no auth)
// ============================================================

export async function getPublishedPortfolioItems(
  userId: string
): Promise<PortfolioItem[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", userId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Failed to fetch published portfolio items:", error);
    return [];
  }

  return data.map(mapDbToPortfolioItem);
}

// ============================================================
// Reorder portfolio items
// ============================================================

export async function reorderPortfolioItems(
  itemIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Verify all items belong to the user
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("id")
    .eq("user_id", user.id)
    .in("id", itemIds);

  if (!items || items.length !== itemIds.length) {
    return { success: false, error: "Some items not found or not yours" };
  }

  // Update order_index for each item
  for (let i = 0; i < itemIds.length; i++) {
    const { error } = await supabase
      .from("portfolio_items")
      .update({ order_index: i })
      .eq("id", itemIds[i])
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to reorder item:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
