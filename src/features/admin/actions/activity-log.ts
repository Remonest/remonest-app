/**
 * Server Actions: Admin Activity Logging
 * 
 * Provides actions for fetching and managing admin activity logs.
 * All actions require admin role and are protected by RLS policies.
 */

"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin action type enum
 */
export type AdminActionType =
  | "approve_job"
  | "reject_job"
  | "delete_job"
  | "publish_job"
  | "republish_job"
  | "update_job"
  | "create_learning_module"
  | "update_learning_module"
  | "delete_learning_module"
  | "update_user_role"
  | "update_user_settings"
  | "update_user_profile"
  | "create_user"
  | "delete_user"
  | "update_site_settings"
  | "other";

/**
 * Admin action record interface
 */
export interface AdminActionRecord {
  id: string;
  admin_id: string;
  admin_name: string | null;
  admin_email: string | null;
  target_user_id: string | null;
  target_user_name: string | null;
  target_user_email: string | null;
  action_type: AdminActionType;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  notes: string | null;
  created_at: string;
}

/**
 * Admin action statistics
 */
export interface AdminActionStats {
  action_type: AdminActionType;
  action_count: number;
  first_action: string;
  last_action: string;
}

/**
 * Fetch recent admin actions
 * 
 * @param limit - Number of actions to fetch (default: 50, max: 200)
 * @param offset - Number of actions to skip (for pagination)
 * @returns Array of admin action records
 */
export async function getRecentAdminActions(limit: number = 50, offset: number = 0): Promise<AdminActionRecord[]> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("recent_admin_actions")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching admin actions:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch admin action statistics
 * 
 * @returns Array of action type statistics
 */
export async function getAdminActionStats(): Promise<AdminActionStats[]> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("admin_action_summary")
    .select("*")
    .order("action_count", { ascending: false });

  if (error) {
    console.error("Error fetching admin action stats:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch admin actions filtered by action type
 * 
 * @param actionType - Type of action to filter by
 * @param limit - Number of actions to fetch
 * @returns Filtered array of admin action records
 */
export async function getAdminActionsByType(
  actionType: AdminActionType,
  limit: number = 50
): Promise<AdminActionRecord[]> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("admin_actions")
    .select(`
      *,
      admin_profile:user_profiles!admin_actions_admin_id_fkey(full_name),
      target_user_profile:user_profiles!admin_actions_target_user_id_fkey(full_name)
    `)
    .eq("action_type", actionType)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching admin actions by type:", error);
    return [];
  }

  // Transform to match interface
  return (data || []).map((item: any) => ({
    id: item.id,
    admin_id: item.admin_id,
    admin_name: item.admin_profile?.full_name || null,
    admin_email: null, // Need to join with auth.users for email
    target_user_id: item.target_user_id,
    target_user_name: item.target_user_profile?.full_name || null,
    target_user_email: null,
    action_type: item.action_type,
    table_name: item.table_name,
    record_id: item.record_id,
    old_values: item.old_values || {},
    new_values: item.new_values || {},
    notes: item.notes,
    created_at: item.created_at,
  }));
}

/**
 * Fetch admin actions by specific admin
 * 
 * @param adminId - Admin user ID to filter by
 * @param limit - Number of actions to fetch
 * @returns Filtered array of admin action records
 */
export async function getAdminActionsByAdminId(
  adminId: string,
  limit: number = 50
): Promise<AdminActionRecord[]> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("recent_admin_actions")
    .select("*")
    .eq("admin_id", adminId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching admin actions by admin ID:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch admin actions affecting specific user
 * 
 * @param targetUserId - Target user ID to filter by
 * @param limit - Number of actions to fetch
 * @returns Filtered array of admin action records
 */
export async function getAdminActionsByTargetUser(
  targetUserId: string,
  limit: number = 50
): Promise<AdminActionRecord[]> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("recent_admin_actions")
    .select("*")
    .eq("target_user_id", targetUserId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching admin actions by target user:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch single admin action by ID
 * 
 * @param actionId - Action ID to fetch
 * @returns Single admin action record or null
 */
export async function getAdminActionById(actionId: string): Promise<AdminActionRecord | null> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("recent_admin_actions")
    .select("*")
    .eq("id", actionId)
    .single();

  if (error) {
    console.error("Error fetching admin action by ID:", error);
    return null;
  }

  return data;
}

/**
 * Get count of admin actions in last N hours
 * 
 * @param hours - Number of hours to look back
 * @returns Count of actions
 */
export async function getRecentActionCount(hours: number = 24): Promise<number> {
  // Require admin access
  await requireAdmin();

  const supabase = getSupabaseServiceClient();

  const { count, error } = await supabase
    .from("admin_actions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error("Error counting recent actions:", error);
    return 0;
  }

  return count || 0;
}
