"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ActivityEntry } from "@/features/dashboard/types/dashboard";

// ============================================================
// Helpers
// ============================================================

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function mapActionToStatus(actionType: string): string {
  const map: Record<string, string> = {
    job_applied: "pending",
    module_started: "in-progress",
    module_completed: "completed",
    profile_updated: "completed",
    cv_updated: "completed",
    portfolio_updated: "completed",
  };
  return map[actionType] ?? "pending";
}

// ============================================================
// Recent Activity
// ============================================================

export async function getRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("id, action_type, title, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((entry) => ({
    id: entry.id,
    actionType: entry.action_type,
    title: entry.title,
    company: (entry.metadata as Record<string, unknown>)?.company as string ?? "",
    time: timeAgo(entry.created_at),
    status: mapActionToStatus(entry.action_type),
  }));
}
