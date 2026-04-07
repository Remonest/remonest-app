import { requireAuth } from "@/lib/auth/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
