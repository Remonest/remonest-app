'use server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import type { JobType, JobStatus } from './utils';
import type { ApplyMethod } from './utils';
import { jobSubmissionSchema, jobApprovalSchema } from './utils';

// Helper function to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

// Get all published jobs
export async function getJobs(filters?: {
  job_type?: JobType;
  search?: string;
  location?: string;
}) {
  const supabase = getSupabaseServerClient();

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters?.job_type) {
    query = query.eq('job_type', filters.job_type);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

// Get job by ID
export async function getJobById(id: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
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
    .from('jobs')
    .select('*')
    .eq('posted_by_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user jobs:', error);
    return [];
  }

  return data || [];
}

// Get pending jobs for admin approval
export async function getPendingJobs() {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      user_profiles!posted_by_user_id (
        full_name,
        email
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending jobs:', error);
    return [];
  }

  return data || [];
}

// Get all jobs for admin (all statuses)
export async function getAllJobs() {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user.id))) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      user_profiles!posted_by_user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }

  return data || [];
}

// Submit a new job posting
export async function submitJob(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login untuk memposting lowongan' };
  }

  // Parse and validate form data
  const rawFormData = {
    title: formData.get('title') as string,
    company: formData.get('company') as string,
    description_html: formData.get('description_html') as string,
    job_type: formData.get('job_type') as JobType,
    salary_min: formData.get('salary_min') as string,
    salary_max: formData.get('salary_max') as string,
    salary_currency: formData.get('salary_currency') as string,
    location: formData.get('location') as string,
    apply_method: formData.get('apply_method') as ApplyMethod,
    apply_url: formData.get('apply_url') as string,
    apply_email: formData.get('apply_email') as string,
    deadline: formData.get('deadline') as string,
    duration_estimate: formData.get('duration_estimate') as string,
  };

  const validation = jobSubmissionSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      success: false,
      error: 'Validasi gagal',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const validatedData = validation.data;

  // Check if user is admin to determine status
  const userIsAdmin = await isAdmin(user.id);
  const initialStatus: JobStatus = userIsAdmin ? 'published' : 'pending';
  const isVerified = userIsAdmin;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
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
    console.error('Error creating job:', error);
    return { success: false, error: 'Gagal memposting lowongan' };
  }

  // Revalidate relevant paths
  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return {
    success: true,
    data,
    message: userIsAdmin
      ? 'Lowongan berhasil diterbitkan'
      : 'Lowongan berhasil dikirim untuk persetujuan admin',
  };
}

// Save job as draft
export async function saveJobDraft(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login untuk menyimpan draft' };
  }

  // Parse and validate form data (partial validation for draft)
  const rawFormData = {
    title: formData.get('title') as string,
    company: formData.get('company') as string,
    description_html: formData.get('description_html') as string,
    job_type: formData.get('job_type') as JobType,
    salary_min: formData.get('salary_min') as string,
    salary_max: formData.get('salary_max') as string,
    salary_currency: formData.get('salary_currency') as string,
    location: formData.get('location') as string,
    apply_method: formData.get('apply_method') as ApplyMethod,
    apply_url: formData.get('apply_url') as string,
    apply_email: formData.get('apply_email') as string,
    deadline: formData.get('deadline') as string,
    duration_estimate: formData.get('duration_estimate') as string,
  };

  // Relaxed validation for drafts
  const partialValidation = jobSubmissionSchema.safeParse(rawFormData);

  if (!partialValidation.success) {
    return {
      success: false,
      error: 'Validasi gagal',
      errors: partialValidation.error.flatten().fieldErrors,
    };
  }

  const validatedData = partialValidation.data;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...validatedData,
      status: 'draft',
      is_verified_by_admin: false,
      posted_by_user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving draft:', error);
    return { success: false, error: 'Gagal menyimpan draft' };
  }

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return { success: true, data, message: 'Draft berhasil disimpan' };
}

// Approve a pending job
export async function approveJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login' };
  }

  if (!(await isAdmin(user.id))) {
    return { success: false, error: 'Hanya admin yang bisa menyetujui lowongan' };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'published',
      is_verified_by_admin: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    console.error('Error approving job:', error);
    return { success: false, error: 'Gagal menyetujui lowongan' };
  }

  if (!data) {
    return { success: false, error: 'Lowongan tidak ditemukan atau sudah diproses' };
  }

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return { success: true, data, message: 'Lowongan berhasil disetujui dan diterbitkan' };
}

// Reject a pending job
export async function rejectJob(jobId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login' };
  }

  if (!(await isAdmin(user.id))) {
    return { success: false, error: 'Hanya admin yang bisa menolak lowongan' };
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'rejected',
      rejection_reason: reason || null,
    })
    .eq('id', jobId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    console.error('Error rejecting job:', error);
    return { success: false, error: 'Gagal menolak lowongan' };
  }

  if (!data) {
    return { success: false, error: 'Lowongan tidak ditemukan atau sudah diproses' };
  }

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return { success: true, data, message: 'Lowongan berhasil ditolak' };
}

// Delete a job
export async function deleteJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login' };
  }

  const supabase = getSupabaseServerClient();

  // Check if user owns the job or is admin
  const { data: job } = await supabase
    .from('jobs')
    .select('posted_by_user_id, status')
    .eq('id', jobId)
    .single();

  if (!job) {
    return { success: false, error: 'Lowongan tidak ditemukan' };
  }

  const userIsAdmin = await isAdmin(user.id);

  if (job.posted_by_user_id !== user.id && !userIsAdmin) {
    return { success: false, error: 'Anda tidak memiliki izin untuk menghapus lowongan ini' };
  }

  // Non-admins can only delete draft or pending jobs
  if (!userIsAdmin && !['draft', 'pending'].includes(job.status)) {
    return { success: false, error: 'Anda hanya bisa menghapus draft atau lowongan yang menunggu persetujuan' };
  }

  const { error } = await supabase.from('jobs').delete().eq('id', jobId);

  if (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: 'Gagal menghapus lowongan' };
  }

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return { success: true, message: 'Lowongan berhasil dihapus' };
}

// Republish an expired job
export async function republishJob(jobId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Anda harus login' };
  }

  const supabase = getSupabaseServerClient();

  // Check if user owns the job or is admin
  const { data: job } = await supabase
    .from('jobs')
    .select('posted_by_user_id')
    .eq('id', jobId)
    .single();

  if (!job) {
    return { success: false, error: 'Lowongan tidak ditemukan' };
  }

  const userIsAdmin = await isAdmin(user.id);

  if (job.posted_by_user_id !== user.id && !userIsAdmin) {
    return { success: false, error: 'Anda tidak memiliki izin untuk mempublikasi ulang lowongan ini' };
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('status', 'expired')
    .select()
    .single();

  if (error) {
    console.error('Error republishing job:', error);
    return { success: false, error: 'Gagal mempublikasi ulang lowongan' };
  }

  if (!data) {
    return { success: false, error: 'Lowongan tidak ditemukan atau tidak dapat dipublikasi ulang' };
  }

  revalidatePath('/jobs');
  revalidatePath('/admin/jobs');

  return { success: true, data, message: 'Lowongan berhasil dipublikasi ulang' };
}
