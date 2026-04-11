"use server";

import { loginSchema } from "@/features/auth/schemas/login";
import type { AuthResult } from "@/features/auth/types/auth";
import { getSupabaseServiceClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.flatten().fieldErrors.email?.[0] ||
        parsed.error.flatten().fieldErrors.password?.[0] ||
        "Invalid input",
    };
  }

  const { email, password } = parsed.data;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed") || error.message.includes("email not confirmed")) {
      return {
        success: false,
        error: "Email not confirmed. Please check your inbox or request a new confirmation email.",
        redirect: `/login?unconfirmed=${encodeURIComponent(email)}`,
      };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Login failed. Please try again." };
  }

  if (!data.user.email_confirmed_at) {
    return {
      success: false,
      error: "Email not confirmed. Please check your inbox or request a new confirmation email.",
      redirect: `/login?unconfirmed=${encodeURIComponent(data.user.email || "")}`,
    };
  }

  // Log login activity for admin tracking
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null;
    const userAgent = headersList.get("user-agent") || null;

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
    console.error("Failed to log login activity:", logError);
  }

  const cookieStore = await cookies();
  const redirectTo =
    cookieStore.get("redirect_after_login")?.value || "/dashboard";

  cookieStore.delete("redirect_after_login");

  redirect(redirectTo);
}

export async function googleSignInAction(): Promise<void> {
  const supabase = getSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.url) {
    redirect(data.url);
  }
}
