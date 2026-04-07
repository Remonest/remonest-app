import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Get the current authenticated user in a Server Component.
 * Returns `null` if no session is active.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication in a Server Component.
 * Redirects to /login if no active session.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user!; // We know user is non-null here due to the redirect check
}
