"use server";

import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions/guards";
import { revalidatePath } from "next/cache";
import type { JobStatus, ApplyMethod } from "@/features/jobs/types/job";
import { jobSubmissionSchema, jobDraftSchema } from "@/features/jobs/schemas/job-submission";

// ============================================================
// Helper: Check if user is admin
// ============================================================

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("❌ isAdmin check failed:", error);
    return false;
  }
  return data.role === "admin";
}

// ============================================================
// Submit a new job posting
// ============================================================

export async function submitJobAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: "Anda harus login untuk memposting lowongan",
    };
  }

  const rawFormData = {
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    description_html: formData.get("description_html") as string,
    job_type: formData.get("job_type") as JobStatus,
    salary_min: formData.get("salary_min") as string,
    salary_max: formData.get("salary_max") as string,
    salary_currency: formData.get("salary_currency") as string,
    location: formData.get("location") as string,
    apply_method: formData.get("apply_method") as ApplyMethod,
    apply_url: formData.get("apply_url") as string,
    apply_email: formData.get("apply_email") as string,
    deadline: formData.get("deadline") as string,
    duration_estimate: formData.get("duration_estimate") as string,
  };

  const validation = jobSubmissionSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      success: false,
      error: "Validasi gagal",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const validatedData = validation.data;
  const userIsAdmin = await isAdmin(user.id);

  const initialStatus: JobStatus = userIsAdmin ? "published" : "pending";
  const isVerified: boolean | null = userIsAdmin ? true : null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...validatedData,
      status: initialStatus,
      is_verified_by_admin: isVerified,
      posted_by_user_id: user.id,
      published_at: userIsAdmin ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating job:", error);
    return { success: false, error: "Gagal memposting lowongan" };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");

  return {
    success: true,
    data,
    message: userIsAdmin
      ? "Lowongan berhasil diterbitkan dan terverifikasi"
      : "Lowongan berhasil dikirim untuk persetujuan admin",
  };
}

// ============================================================
// Save job as draft
// ============================================================

export async function saveJobDraftAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login untuk menyimpan draft" };
  }

  const getSafeValue = (key: string, defaultValue = ""): string => {
    const value = formData.get(key);
    return value ? value.toString() : defaultValue;
  };

  const rawFormData = {
    title: getSafeValue("title"),
    company: getSafeValue("company"),
    description_html: getSafeValue("description_html"),
    job_type: getSafeValue("job_type") as JobStatus,
    salary_min: getSafeValue("salary_min") || "0",
    salary_max: getSafeValue("salary_max") || "0",
    salary_currency: getSafeValue("salary_currency", "IDR"),
    location: getSafeValue("location"),
    apply_method: getSafeValue("apply_method") as ApplyMethod,
    apply_url: getSafeValue("apply_url", ""),
    apply_email: getSafeValue("apply_email", ""),
    deadline: getSafeValue("deadline", ""),
    duration_estimate: getSafeValue("duration_estimate", ""),
    is_verified_by_admin: "",
  };

  const draftValidation = jobDraftSchema.safeParse(rawFormData);

  if (!draftValidation.success) {
    console.error("Draft validation failed:", draftValidation.error);
    return {
      success: false,
      error: "Validasi gagal",
      errors: draftValidation.error.flatten().fieldErrors,
    };
  }

  const validatedData = draftValidation.data;

  const insertData = Object.fromEntries(
    Object.entries(validatedData || {}).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, any>;

  const applyMethod = insertData.apply_method;
  if (applyMethod === "email") {
    delete insertData.apply_url;
    if (
      !insertData.apply_email ||
      (typeof insertData.apply_email === "string" &&
        insertData.apply_email.trim() === "")
    ) {
      insertData.apply_email = null;
    }
  } else if (applyMethod === "url") {
    delete insertData.apply_email;
    if (
      !insertData.apply_url ||
      (typeof insertData.apply_url === "string" &&
        insertData.apply_url.trim() === "")
    ) {
      insertData.apply_url = null;
    }
  } else {
    delete insertData.apply_method;
    delete insertData.apply_url;
    delete insertData.apply_email;
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...insertData,
      status: "draft",
      is_verified_by_admin: false,
      posted_by_user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Error saving draft:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan draft",
      code: error.code,
    };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, data, message: "Draft berhasil disimpan" };
}
