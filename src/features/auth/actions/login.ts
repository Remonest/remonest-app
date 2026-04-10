"use server";

import { loginSchema } from "@/features/auth/schemas/login";
import type { AuthResult } from "@/features/auth/types/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
