import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export interface AdminUser {
  id: string;
  email: string;
  role: "admin" | "user";
  full_name?: string;
  avatar_url?: string;
}

/**
 * Require admin authentication in a Server Component.
 * Redirects to /login if unauthenticated, or to /dashboard if not an admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await requireAuth();

  const supabase = getSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // If RLS error, use service role key to bypass
  if (error && (error.code === "42P17" || error.code === "42501")) {
    console.warn("requireAdmin: RLS issue detected, using admin client bypass...");
    
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceUrl && serviceKey) {
      const adminClient = createClient(serviceUrl, serviceKey);
      const { data: adminProfile } = await adminClient
        .from("user_profiles")
        .select("role, full_name, avatar_url")
        .eq("id", user.id)
        .single();
        
      if (adminProfile && adminProfile.role === "admin") {
        return {
          id: user.id,
          email: user.email!,
          role: adminProfile.role,
          full_name: adminProfile.full_name,
          avatar_url: adminProfile.avatar_url,
        };
      }
    }
  }

  // If not admin, redirect to dashboard
  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
  };
}
