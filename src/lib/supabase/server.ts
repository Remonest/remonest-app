import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

export function getSupabaseServerClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        const cookieStore = await cookies();
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

/**
 * Admin-only server client that uses the service role key.
 * NEVER expose this to the browser — only use in Server Components,
 * Route Handlers, and Server Actions that require elevated privileges.
 * 
 * Uses createClient directly since service role doesn't need session/cookie management.
 */
export function getSupabaseServiceClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

/**
 * Get the current user's role from user_profiles table
 * Returns null if not authenticated or profile not found
 */
export async function getUserRole(): Promise<
  "admin" | "user" | "client" | null
> {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Try to get role with regular query
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    // Fallback: Try with admin bypass for development
    // This bypasses RLS using service role key (only works server-side)
    if (error.code === "42P17" || error.code === "42501") {
      
      // Import service role client if available
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (serviceUrl && serviceKey) {
          const adminClient = createClient(serviceUrl, serviceKey);
          const { data: adminProfile } = await adminClient
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();
            
          if (adminProfile) {
            return adminProfile.role as "admin" | "user" | "client" | null;
          }
        }
      } catch (fallbackError) {
        // Fallback also failed
      }
    }

    return null;
  }

  if (!profile) {
    return null;
  }

  return profile.role as "admin" | "user" | "client" | null;
}

/**
 * Guard function: throws if user is not admin
 * Use in Server Actions, Route Handlers, or Server Components
 */
export async function requireAdmin(): Promise<void> {
  const role = await getUserRole();
  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}
