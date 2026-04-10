"use server";

import { registerSchema } from "@/features/auth/schemas/register";
import type { AuthResult } from "@/features/auth/types/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    workType: formData.get("workType"),
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

  const { name, email, password, workType } = parsed.data;
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: workType,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

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
