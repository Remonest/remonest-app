"use server";

import {
  forgotPasswordSchema,
  updatePasswordSchema,
  resendConfirmationSchema,
} from "@/features/auth/schemas/password";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================
// Resend Confirmation Email
// ============================================================

export async function resendConfirmationAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const parsed = resendConfirmationSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Forgot Password
// ============================================================

export async function forgotPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================
// Update Password
// ============================================================

export async function updatePasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      error: errors.password?.[0] || errors.confirmPassword?.[0] || "Invalid input",
    };
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/login?reset=success");
}
