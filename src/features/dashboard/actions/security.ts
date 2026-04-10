"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { passwordSchema } from "@/features/dashboard/schemas/password";

// ============================================================
// Update Password
// ============================================================

export async function updatePassword(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors.newPassword?.[0] || "Invalid input";
    return { success: false, error: firstError };
  }

  const { currentPassword, newPassword } = parsed.data;

  // Re-authenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Current password is incorrect" };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) return { success: false, error: updateError.message };

  return { success: true };
}
