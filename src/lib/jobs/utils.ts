import { z } from 'zod';

// Enum types matching database
export type JobType = 'full-time' | 'part-time' | 'project' | 'freelance';
export type JobStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'expired';
export type ApplyMethod = 'url' | 'email';

// Zod schemas for validation
export const jobSubmissionSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter').max(100),
  company: z.string().min(2, 'Nama perusahaan minimal 2 karakter').max(100),
  description_html: z.string().min(50, 'Deskripsi minimal 50 karakter'),
  job_type: z.enum(['full-time', 'part-time', 'project', 'freelance']),
  salary_min: z.coerce.number().int().min(0, 'Gaji minimum tidak valid').optional(),
  salary_max: z.coerce.number().int().min(0, 'Gaji maksimum tidak valid').optional(),
  salary_currency: z.string().default('IDR'),
  location: z.string().min(1, 'Lokasi wajib diisi').max(200),
  apply_method: z.enum(['url', 'email']),
  apply_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  apply_email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  deadline: z.coerce.date().min(new Date(), 'Deadline tidak boleh di masa lalu').optional(),
  duration_estimate: z.string().max(100, 'Estimasi durasi terlalu panjang').optional(),
});

export const jobApprovalSchema = z.object({
  job_id: z.string().uuid(),
  rejection_reason: z.string().max(500, 'Alasan penolakan maksimal 500 karakter').optional(),
});

// Format salary for display
export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string = 'IDR'
): string {
  if (!min && !max) return 'Dirahasikan';

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(0)}jt`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}rb`;
    }
    return num.toString();
  };

  if (min && max && min !== max) {
    return `${currency} ${formatNumber(min)} - ${formatNumber(max)}`;
  } else if (min) {
    return `${currency} ${formatNumber(min)}`;
  } else if (max) {
    return `${currency} ${formatNumber(max)}`;
  }

  return 'Dirahasikan';
}

// Format deadline for display
export function formatDeadline(date: Date | string | null): string | null {
  if (!date) return null;

  const deadline = new Date(date);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Sudah berakhir';
  } else if (diffDays === 1) {
    return 'Besok';
  } else if (diffDays <= 7) {
    return `${diffDays} hari lagi`;
  } else if (diffDays <= 30) {
    return `${Math.ceil(diffDays / 7)} minggu lagi`;
  } else if (diffDays <= 365) {
    return `${Math.ceil(diffDays / 30)} bulan lagi`;
  } else {
    return deadline.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

// Get job type label in Indonesian
export function getJobTypeLabel(type: JobType): string {
  const labels: Record<JobType, string> = {
    'full-time': 'Full-Time',
    'part-time': 'Part-Time',
    'project': 'Project',
    'freelance': 'Freelance',
  };

  return labels[type] || type;
}

// Get status label in Indonesian
export function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    'draft': 'Draft',
    'pending': 'Menunggu Persetujuan',
    'approved': 'Disetujui',
    'rejected': 'Ditolak',
    'published': 'Terbit',
    'expired': 'Kedaluwarsa',
  };

  return labels[status] || status;
}