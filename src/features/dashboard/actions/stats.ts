"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/features/dashboard/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Applications count
  const { count: appCount } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Modules completed
  const { count: moduleCount } = await supabase
    .from("user_learning_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  // Recent applications (this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const { count: recentApps } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("applied_at", oneWeekAgo.toISOString());

  // Modules in progress
  const { count: inProgress } = await supabase
    .from("user_learning_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gt("progress", 0)
    .is("completed_at", null);

  return {
    applicationsSent: appCount ?? 0,
    modulesCompleted: moduleCount ?? 0,
    profileViews: 0,
    cvDownloads: 0,
    applicationsChange: `+${recentApps ?? 0} this week`,
    modulesChange: `${inProgress ?? 0} in progress`,
    profileViewsChange: "Coming soon",
    cvDownloadsChange: "Coming soon",
  };
}
