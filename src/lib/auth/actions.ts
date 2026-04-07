"use server";

import { loginSchema, registerSchema } from "@/lib/auth/schemas";
import type { AuthResult } from "@/lib/auth/schemas";
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
    // Check if the error is due to unconfirmed email
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

  // Check if email is confirmed
  if (!data.user.email_confirmed_at) {
    return {
      success: false,
      error: "Email not confirmed. Please check your inbox or request a new confirmation email.",
      redirect: `/login?unconfirmed=${encodeURIComponent(data.user.email || "")}`,
    };
  }

  // Check for a stored redirect path (set by middleware or login page)
  const cookieStore = await cookies();
  const redirectTo =
    cookieStore.get("redirect_after_login")?.value || "/dashboard";

  // Clean up the cookie
  cookieStore.delete("redirect_after_login");

  redirect(redirectTo);
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const firstError =
      fieldErrors.name?.[0] ||
      fieldErrors.email?.[0] ||
      fieldErrors.password?.[0] ||
      fieldErrors.confirmPassword?.[0] ||
      "Invalid input";
    return { success: false, error: firstError };
  }

  const { name, email, password } = parsed.data;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // If email confirmation is enabled in Supabase, show a message
  if (data?.user && !data.session) {
    return {
      success: true,
      redirect: "/login?confirmed=false",
    };
  }

  const cookieStore = await cookies();
  const redirectTo = cookieStore.get("redirect_after_login")?.value || "/dashboard";
  cookieStore.delete("redirect_after_login");

  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
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

export async function resendConfirmationAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Forgot / Reset Password
// ============================================================

const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function forgotPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (!/[A-Z]/.test(password)) {
    return { success: false, error: "Password must contain at least one uppercase letter" };
  }

  if (!/[a-z]/.test(password)) {
    return { success: false, error: "Password must contain at least one lowercase letter" };
  }

  if (!/[0-9]/.test(password)) {
    return { success: false, error: "Password must contain at least one number" };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/login?reset=success");
}
