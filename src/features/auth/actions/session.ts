"use server";

import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function logoutAction(): Promise<void> {
  const supabase = getSupabaseServerClient();
  
  // Get current user before signing out
  const { data: { user } } = await supabase.auth.getUser();

  // Log logout activity for admin tracking
  if (user) {
    try {
      const headersList = await headers();
      const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
      const userAgent = headersList.get("user-agent") || null;

      // Get user role from user_profiles
      const serviceSupabase = getSupabaseServiceClient();
      const { data: profile } = await serviceSupabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Call database function to log logout
      await serviceSupabase.rpc("log_user_logout", {
        p_user_id: user.id,
        p_email: user.email || null,
        p_role: profile?.role || "user",
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
      });
    } catch (logError) {
      // Log error but don't fail the logout
      console.error("Failed to log logout activity:", logError);
    }
  }

  await supabase.auth.signOut();
  redirect("/");
}
