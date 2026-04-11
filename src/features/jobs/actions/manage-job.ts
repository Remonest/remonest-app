"use server";

import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions/guards";
import { revalidatePath } from "next/cache";
import type { JobType, ApplyMethod } from "@/features/jobs/types/job";
import { jobSubmissionSchema } from "@/features/jobs/schemas/job-submission";

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
    return false;
  }
  return data.role === "admin";
}

// ============================================================
// Update a job (for clients to edit their draft jobs)
// ============================================================

export async function updateJobAction(jobId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login untuk mengedit lowongan" };
  }

  const userIsAdmin = await isAdmin(user.id);

  const rawFormData = {
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    description_html: formData.get("description_html") as string,
    job_type: formData.get("job_type") as JobType,
    salary_min: formData.get("salary_min") as string,
    salary_max: formData.get("salary_max") as string,
    salary_currency: (formData.get("salary_currency") as string) || "IDR",
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

  const supabase = getSupabaseServerClient();
  const { data: existingJob, error: checkError } = await supabase
    .from("jobs")
    .select("id, posted_by_user_id, status")
    .eq("id", jobId)
    .single();

  if (checkError) {
    return { success: false, error: "Gagal memeriksa kepemilikan lowongan" };
  }

  if (!existingJob) {
    return { success: false, error: "Lowongan tidak ditemukan" };
  }

  if (existingJob.posted_by_user_id !== user.id && !userIsAdmin) {
    return { success: false, error: "Anda tidak memiliki izin untuk mengedit lowongan ini" };
  }

  if (!userIsAdmin && !["draft", "pending"].includes(existingJob.status)) {
    return {
      success: false,
      error: "Hanya bisa mengedit lowongan dengan status draft atau pending",
    };
  }

  const updateData: Record<string, any> = {
    ...validatedData,
    job_id: jobId,
  };

  const action = formData.get("action") as string;
  if (action === "publish" && existingJob.status === "draft") {
    updateData.status = "pending";
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updateData)
    .eq("id", jobId)
    .select()
    .maybeSingle();

  if (error) {
    return { success: false, error: "Gagal mengedit lowongan" };
  }

  if (!data) {
    return { success: false, error: "Lowongan tidak ditemukan" };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");

  const message =
    action === "publish"
      ? "Lowongan berhasil dikirim untuk persetujuan admin"
      : "Lowongan berhasil diupdate";

  return { success: true, data, message };
}

// ============================================================
// Delete a job
// ============================================================

export async function deleteJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const supabase = getSupabaseServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("posted_by_user_id, status")
    .eq("id", jobId)
    .single();

  if (!job) {
    return { success: false, error: "Lowongan tidak ditemukan" };
  }

  const userIsAdmin = await isAdmin(user.id);

  if (job.posted_by_user_id !== user.id && !userIsAdmin) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk menghapus lowongan ini",
    };
  }

  if (!userIsAdmin && !["draft", "pending"].includes(job.status)) {
    return {
      success: false,
      error:
        "Anda hanya bisa menghapus draft atau lowongan yang menunggu persetujuan",
    };
  }

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    return { success: false, error: "Gagal menghapus lowongan" };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/dashboard/jobs");

  return { success: true, message: "Lowongan berhasil dihapus" };
}

// ============================================================
// Republish an expired job
// ============================================================

export async function republishJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const supabase = getSupabaseServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("posted_by_user_id")
    .eq("id", jobId)
    .single();

  if (!job) {
    return { success: false, error: "Lowongan tidak ditemukan" };
  }

  const userIsAdmin = await isAdmin(user.id);

  if (job.posted_by_user_id !== user.id && !userIsAdmin) {
    return {
      success: false,
      error: "Anda tidak memiliki izin untuk mempublikasi ulang lowongan ini",
    };
  }

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "expired")
    .select()
    .single();

  if (error) {
    return { success: false, error: "Gagal mempublikasi ulang lowongan" };
  }

  if (!data) {
    return {
      success: false,
      error: "Lowongan tidak ditemukan atau tidak dapat dipublikasi ulang",
    };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return {
    success: true,
    data,
    message: "Lowongan berhasil dipublikasi ulang",
  };
}
