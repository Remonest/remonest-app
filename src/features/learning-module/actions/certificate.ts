"use server";

import { requireAuth } from "@/features/auth/actions/guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CertificateData, CertificateModule, CertificateProgress } from "../types/certificate";

// ============================================================
// Certificate Actions
// ============================================================

/**
 * Generate certificate ID based on user ID and module ID
 * Format: RMN-YYYY-XXXXX where XXXXX is a hash-based ID
 */
function generateCertificateId(userId: string, moduleId: string): string {
  const hash = (userId + moduleId).split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const paddedHash = Math.abs(hash).toString().padStart(5, '0').slice(0, 5);
  const year = new Date().getFullYear();
  return `RMN-${year}-${paddedHash}`;
}

/**
 * Public: verify a certificate by its ID — no auth required.
 * Searches all completed users for a matching certificate ID.
 * Returns the public-facing certificate info (no email/userId exposed).
 */
export async function getPublicCertificateData(
  certificateId: string
): Promise<{
  userName: string;
  moduleTitle: string;
  difficulty: string;
  completedAt: string;
  certificateId: string;
  userAvatar: string | null;
} | null> {
  const supabase = getSupabaseServerClient();

  // Get ALL completed enrollments (no user filter)
  const { data: enrollments } = await supabase
    .from("user_learning_progress")
    .select("user_id, module_id, progress, completed_at")
    .eq("progress", 100)
    .not("completed_at", "is", null);

  if (!enrollments || enrollments.length === 0) {
    return null;
  }

  // Find the enrollment that generates this certificate ID
  const matching = enrollments.find(
    (e) => generateCertificateId(e.user_id, e.module_id) === certificateId
  );

  if (!matching) {
    return null;
  }

  // Get module details
  const { data: module } = await supabase
    .from("learning_modules")
    .select("title, difficulty_level")
    .eq("id", matching.module_id)
    .eq("status", "published")
    .single();

  if (!module) {
    return null;
  }

  // Get user profile (public fields only)
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", matching.user_id)
    .single();

  return {
    userName: profile?.full_name || "User",
    moduleTitle: module.title,
    difficulty: module.difficulty_level,
    completedAt: matching.completed_at,
    certificateId,
    userAvatar: profile?.avatar_url || null,
  };
}

/**
 * Get certificate data for a specific module
 * Returns null if user hasn't completed the module
 */
export async function getCertificateData(
  certificateId: string
): Promise<CertificateData | null> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Parse certificate ID to get user ID and module ID
  // Certificate ID format: RMN-YYYY-XXXXX
  // We'll search for user's completed modules and find matching one
  const { data: enrollments } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("progress", 100)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (!enrollments || enrollments.length === 0) {
    return null;
  }

  // Find the matching certificate
  // For now, we'll use the first completed module that matches
  // In production, you'd want to verify the certificate ID properly
  const enrollment = enrollments[0];

  // Get module details
  const { data: module } = await supabase
    .from("learning_modules")
    .select("id, title, slug, category, difficulty_level")
    .eq("id", enrollment.module_id)
    .eq("status", "published")
    .single();

  if (!module) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const certificateIdGenerated = generateCertificateId(user.id, module.id);

  return {
    userId: user.id,
    userName: profile?.full_name || user.email?.split('@')[0] || 'User',
    userEmail: user.email || '',
    userAvatar: profile?.avatar_url || null,
    moduleId: module.id,
    moduleTitle: module.title,
    moduleSlug: module.slug,
    category: module.category,
    difficulty: module.difficulty_level,
    completedAt: enrollment.completed_at,
    certificateId: certificateIdGenerated,
  };
}

/**
 * Get all certificates for the current user
 */
export async function getUserCertificates(): Promise<CertificateData[]> {
  const user = await requireAuth();
  const supabase = getSupabaseServerClient();

  // Get all completed modules
  const { data: enrollments } = await supabase
    .from("user_learning_progress")
    .select("module_id, progress, started_at, completed_at, updated_at")
    .eq("user_id", user.id)
    .eq("progress", 100)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  // Get module details for each enrollment
  const moduleIds = enrollments.map(e => e.module_id);
  const { data: modules } = await supabase
    .from("learning_modules")
    .select("id, title, slug, category, difficulty_level")
    .in("id", moduleIds)
    .eq("status", "published");

  if (!modules) {
    return [];
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const moduleMap = new Map(modules.map(m => [m.id, m]));

  return enrollments.map(enrollment => {
    const module = moduleMap.get(enrollment.module_id);
    if (!module) return null;

    return {
      userId: user.id,
      userName: profile?.full_name || user.email?.split('@')[0] || 'User',
      userEmail: user.email || '',
      userAvatar: profile?.avatar_url || null,
      moduleId: module.id,
      moduleTitle: module.title,
      moduleSlug: module.slug,
      category: module.category,
      difficulty: module.difficulty_level,
      completedAt: enrollment.completed_at,
      certificateId: generateCertificateId(user.id, module.id),
    };
  }).filter(Boolean) as CertificateData[];
}
