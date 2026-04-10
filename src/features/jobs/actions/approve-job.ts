"use server";

import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabase/server";
import { getCurrentUser } from "@/features/auth/actions/guards";
import { revalidatePath } from "next/cache";

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
// Approve a pending job
// ============================================================

export async function approveJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  if (!(await isAdmin(user.id))) {
    return {
      success: false,
      error: "Hanya admin yang bisa menyetujui lowongan",
    };
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "published",
      is_verified_by_admin: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error approving job:", error);
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "Lowongan tidak ditemukan atau sudah diproses",
      };
    }
    return { success: false, error: "Gagal menyetujui lowongan" };
  }

  if (!data) {
    return {
      success: false,
      error: "Lowongan tidak ditemukan atau sudah diproses",
    };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return {
    success: true,
    data,
    message: "Lowongan berhasil disetujui dan diterbitkan",
  };
}

// ============================================================
// Publish a draft job (admin operation)
// ============================================================

export async function publishDraftJobAction(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  if (!(await isAdmin(user.id))) {
    return { success: false, error: "Hanya admin yang bisa menerbitkan lowongan" };
  }

  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "published",
      is_verified_by_admin: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("status", "draft")
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error publishing draft job:", error);
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "Draft tidak ditemukan atau sudah diterbitkan",
      };
    }
    return { success: false, error: "Gagal menerbitkan draft" };
  }

  if (!data) {
    return {
      success: false,
      error: "Draft tidak ditemukan atau sudah diterbitkan",
    };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, data, message: "Draft berhasil diterbitkan" };
}

// ============================================================
// Reject a pending job
// ============================================================

export async function rejectJobAction(jobId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  if (!(await isAdmin(user.id))) {
    return { success: false, error: "Hanya admin yang bisa menolak lowongan" };
  }

  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "rejected",
      is_verified_by_admin: false,
      rejection_reason: reason || null,
    })
    .eq("id", jobId)
    .eq("status", "pending")
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error rejecting job:", error);
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "Lowongan tidak ditemukan atau sudah diproses",
      };
    }
    return { success: false, error: "Gagal menolak lowongan" };
  }

  if (!data) {
    return {
      success: false,
      error: "Lowongan tidak ditemukan atau sudah diproses",
    };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, data, message: "Lowongan berhasil ditolak" };
}
