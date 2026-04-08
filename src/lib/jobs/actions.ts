"use server";

import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
} from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import type { JobType, JobStatus } from "./utils";
import type { ApplyMethod } from "./utils";
import { jobSubmissionSchema, jobDraftSchema } from "./utils";
import { is } from "zod/v4/locales";

// Helper function to check if user is admin (uses service role to bypass RLS)
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

// Get all published jobs
export async function getJobs(filters?: {
  job_type?: JobType;
  search?: string;
  location?: string;
}) {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filters?.job_type) {
    query = query.eq("job_type", filters.job_type);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
    );
  }

  if (filters?.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }

  return data || [];
}

// Get job by ID
export async function getJobById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job:", error);
    return null;
  }

  return data;
}

// Get jobs posted by current user
export async function getUserJobs() {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("posted_by_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user jobs:", error);
    return [];
  }

  return data || [];
}

// Get pending jobs for admin approval
export async function getPendingJobs() {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    console.log("🚫 User not authenticated or not admin");
    return [];
  }

  console.log("✅ Admin user authenticated:", user.id);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching pending jobs:", error);
    return [];
  }

  console.log(
    "✅ Pending jobs fetched successfully:",
    data?.length || 0,
    "jobs",
  );
  return data || [];
}

// Test function to check jobs in database
export async function testJobsQuery() {
  const user = await getCurrentUser();
  if (!user) {
    console.log("🚫 User not authenticated for test query");
    return { authenticated: false };
  }

  const supabase = getSupabaseServerClient();

  // Test basic query
  const { data: allData, error: allError } = await supabase
    .from("jobs")
    .select("id, title, status")
    .order("created_at", { ascending: false });

  console.log("📊 Test Query Results:");
  console.log("- Authenticated:", true);
  console.log("- Total jobs count:", allData?.length || 0);
  console.log("- Jobs by status:", {
    draft: allData?.filter((j) => j.status === "draft")?.length || 0,
    pending: allData?.filter((j) => j.status === "pending")?.length || 0,
    published: allData?.filter((j) => j.status === "published")?.length || 0,
    other:
      allData?.filter(
        (j) => !["draft", "pending", "published"].includes(j.status),
      )?.length || 0,
  });

  if (allError) {
    console.error("❌ Test query error:", allError);
  }

  return {
    authenticated: true,
    totalJobs: allData?.length || 0,
    byStatus: {
      draft: allData?.filter((j) => j.status === "draft")?.length || 0,
      pending: allData?.filter((j) => j.status === "pending")?.length || 0,
      published: allData?.filter((j) => j.status === "published")?.length || 0,
    },
  };
}

// Get all jobs for admin (all statuses)
export async function getAllJobs() {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    console.log("🚫 User not authenticated or not admin for getAllJobs");
    return [];
  }

  console.log("✅ Admin user authenticated for getAllJobs:", user.id);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching all jobs:", error);
    return [];
  }

  console.log("✅ All jobs fetched successfully:", data?.length || 0, "jobs");
  return data || [];
}

// Submit a new job posting
export async function submitJob(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      error: "Anda harus login untuk memposting lowongan",
    };
  }

  // Debug: Log received form data
  console.log("Server received form data:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  // Parse and validate form data
  const rawFormData = {
    title: formData.get("title") as string,
    company: formData.get("company") as string,
    description_html: formData.get("description_html") as string,
    job_type: formData.get("job_type") as JobType,
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

  console.log("Parsed raw form data:", rawFormData);

  const validation = jobSubmissionSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      success: false,
      error: "Validasi gagal",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const validatedData = validation.data;

  // Check if user is admin to determine status and verification
  const userIsAdmin = await isAdmin(user.id);
  
  // Admin: published immediately with verified status
  // Client: pending with null verification (not yet reviewed)
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

  // Revalidate relevant paths
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

// Save job as draft
export async function saveJobDraft(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login untuk menyimpan draft" };
  }

  // Debug: Log received form data
  console.log("Server received draft form data:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value} (type: ${typeof value})`);
  }

  // Parse form data with null safety
  const getSafeValue = (key: string, defaultValue = ""): string => {
    const value = formData.get(key);
    return value ? value.toString() : defaultValue;
  };

  const rawFormData = {
    title: getSafeValue("title"),
    company: getSafeValue("company"),
    description_html: getSafeValue("description_html"),
    job_type: getSafeValue("job_type") as JobType,
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

  console.log("Parsed draft form data:", rawFormData);

  // Use lenient draft validation
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

  console.log("Validated draft data:", validatedData);

  // Filter out undefined values before database insert
  const insertData = Object.fromEntries(
    Object.entries(validatedData || {}).filter(
      ([_, value]) => value !== undefined && value !== "",
    ),
  ) as Record<string, any>;

  console.log("Data to insert:", insertData);

  // Handle apply method - allow empty fields for drafts, but clean up
  const applyMethod = insertData.apply_method;
  if (applyMethod === "email") {
    delete insertData.apply_url; // Remove URL field if email method
    // Keep email field even if empty for drafts
    if (
      !insertData.apply_email ||
      (typeof insertData.apply_email === "string" &&
        insertData.apply_email.trim() === "")
    ) {
      insertData.apply_email = null;
    }
  } else if (applyMethod === "url") {
    delete insertData.apply_email; // Remove email field if URL method
    // Keep URL field even if empty for drafts
    if (
      !insertData.apply_url ||
      (typeof insertData.apply_url === "string" &&
        insertData.apply_url.trim() === "")
    ) {
      insertData.apply_url = null;
    }
  } else {
    // No method selected, remove all
    delete insertData.apply_method;
    delete insertData.apply_url;
    delete insertData.apply_email;
  }

  console.log("Final data after apply method cleanup:", insertData);

  // Check if required fields are present
  console.log("Required fields check:");
  console.log("  Has title:", !!insertData.title);
  console.log("  Has company:", !!insertData.company);
  console.log("  Has location:", !!insertData.location);
  console.log("  Has job_type:", !!insertData.job_type);
  console.log("  User ID:", user.id);

  const supabase = getSupabaseServerClient();
  console.log("Attempting Supabase insert...");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

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
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return {
      success: false,
      error: error.message || "Gagal menyimpan draft",
      code: error.code,
    };
  }

  console.log("✅ Draft saved successfully:", data);

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, data, message: "Draft berhasil disimpan" };
}

// Approve a pending job
export async function approveJob(jobId: string) {
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

  const supabase = getSupabaseServerClient();
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
    .single();

  if (error) {
    console.error("Error approving job:", error);
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

// Reject a pending job
export async function rejectJob(jobId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  if (!(await isAdmin(user.id))) {
    return { success: false, error: "Hanya admin yang bisa menolak lowongan" };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "rejected",
      rejection_reason: reason || null,
    })
    .eq("id", jobId)
    .eq("status", "pending")
    .select()
    .single();

  if (error) {
    console.error("Error rejecting job:", error);
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

// Delete a job
export async function deleteJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const supabase = getSupabaseServerClient();

  // Check if user owns the job or is admin
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

  // Non-admins can only delete draft or pending jobs
  if (!userIsAdmin && !["draft", "pending"].includes(job.status)) {
    return {
      success: false,
      error:
        "Anda hanya bisa menghapus draft atau lowongan yang menunggu persetujuan",
    };
  }

  const { error } = await supabase.from("jobs").delete().eq("id", jobId);

  if (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: "Gagal menghapus lowongan" };
  }

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");

  return { success: true, message: "Lowongan berhasil dihapus" };
}

// Republish an expired job
export async function republishJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const supabase = getSupabaseServerClient();

  // Check if user owns the job or is admin
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
    console.error("Error republishing job:", error);
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
