import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Log OAuth login activity for admin tracking
      try {
        const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
        const userAgent = request.headers.get("user-agent") || null;

        // Get user role from user_profiles
        const serviceSupabase = getSupabaseServiceClient();
        const { data: profile } = await serviceSupabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // Call database function to log login
        await serviceSupabase.rpc("log_user_login", {
          p_user_id: data.user.id,
          p_email: data.user.email || null,
          p_role: profile?.role || "user",
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
        });
      } catch (logError) {
        // Log error but don't fail the login
        console.error("Failed to log OAuth login activity:", logError);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to the login page if something goes wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
